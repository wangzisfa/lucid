'use client';

import { useSessions, newId } from './store';
import { useSettings } from './settings-store';
import { AgentTurn } from './types';
import type { AgentEvent } from './agent-events';

/**
 * Base URL for the server-side agent routes. Empty string = same-origin (web).
 * The mobile shell loads a bundled static build whose origin has no server, so
 * the user points it at their deployed Lucid instance via Settings ›
 * providers › server url. Trailing slash trimmed so `${base}/api/...` is clean.
 */
export function agentApiBase(): string {
  const raw = useSettings.getState().providers.serverUrl?.trim() ?? '';
  return raw.replace(/\/+$/, '');
}

/**
 * Track which (session, turn) pairs already have a runner attached. Guards
 * against double-attachment when the session screen mounts/remounts while a
 * fetch is in flight.
 */
const liveRunners = new Map<string, AbortController>();
const runnerKey = (sessionId: string, turnId: string) => `${sessionId}:${turnId}`;

/**
 * Drive a real Claude Agent SDK session on the server (via SSE) against a
 * specific session in the store.
 *
 *   - fresh run: caller passes `sessionId` + `userText`. Creates a new agent
 *     turn, POSTs `/api/agent/run`, and pipes server events into the store.
 *
 *   - resume:    caller passes `sessionId` + `resumeFromTurnId`. Used by
 *     SessionScreen on mount when a previous turn is mid-approval. The
 *     server-side process is gone after a reload (process-local approval
 *     bus), so the safest thing we can do is mark the chip honest. The user
 *     will re-prompt to get a real continuation.
 */
export async function runAgentScript(opts: {
  sessionId: string;
  userText?: string;
  resumeFromTurnId?: string;
}): Promise<void> {
  const { sessionId, userText = '', resumeFromTurnId } = opts;
  const store = useSessions.getState();
  const session = store.sessions[sessionId];
  if (!session) return;

  if (resumeFromTurnId) {
    // Page-reload resume: there is no server-side state to re-attach to. Just
    // keep the chip honest so the UI still shows PLAN / the approval CTA.
    store.setState(sessionId, 'PLAN');
    return;
  }

  const turnId = newId();
  const key = runnerKey(sessionId, turnId);
  if (liveRunners.has(key)) return;

  const blankTurn: AgentTurn = {
    id: turnId,
    kind: 'agent',
    thoughtFor: 0,
    filesTouched: 0,
    plan: [],
    diff: undefined,
    log: [],
    approved: false,
    ranToCompletion: false,
    createdAt: Date.now(),
  };

  useSessions.getState().setState(sessionId, 'GEN');
  useSessions.getState()._appendTurn(sessionId, blankTurn);

  const ctrl = new AbortController();
  liveRunners.set(key, ctrl);

  let resp: Response;
  try {
    resp = await fetch(`${agentApiBase()}/api/agent/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        userText,
        repoPath: session.repo.path,
        apiKey: useSettings.getState().providers.anthropicKey.trim() || undefined,
      }),
      signal: ctrl.signal,
    });
  } catch (err) {
    liveRunners.delete(key);
    if (!isAbort(err)) emitError(sessionId, turnId, errMessage(err));
    return;
  }

  if (!resp.ok || !resp.body) {
    liveRunners.delete(key);
    emitError(sessionId, turnId, `agent route ${resp.status}`);
    return;
  }

  // Approval is wired from the store action: `approveLatestPlan` POSTs
  // `/api/agent/approve` directly, so we don't need a Zustand subscriber
  // here (which would fire on every state mutation and cause re-render churn
  // during the SSE pump).

  try {
    await pumpSse(resp.body, (ev) => handleEvent(sessionId, turnId, ev));
  } catch (err) {
    if (!isAbort(err)) emitError(sessionId, turnId, errMessage(err));
  } finally {
    liveRunners.delete(key);
  }
}

/**
 * Cancel any in-flight runners for a session — call when the user explicitly
 * cancels or the session is closed.
 */
export function cancelRunners(sessionId: string) {
  for (const [key, ctrl] of liveRunners.entries()) {
    if (key.startsWith(`${sessionId}:`)) ctrl.abort();
  }
}

/**
 * Iterate every session and re-attach a runner to any agent turn that's
 * waiting on the user's `[A] APPROVE PLAN` tap. Call on session-screen mount.
 *
 * Real runners cannot be resumed after a page reload (the server-side process
 * is gone), so this just keeps the chip honest.
 */
export function resumeAwaitingApprovals() {
  const { sessions, order } = useSessions.getState();
  for (const sessionId of order) {
    const sess = sessions[sessionId];
    if (!sess) continue;
    for (let i = sess.turns.length - 1; i >= 0; i--) {
      const t = sess.turns[i];
      if (t.kind !== 'agent') continue;
      if (t.plan.length > 0 && !t.approved && !t.ranToCompletion) {
        useSessions.getState().setState(sessionId, 'PLAN');
      }
      break;
    }
  }
}

// ─── event handlers ──────────────────────────────────────

function handleEvent(sessionId: string, turnId: string, ev: AgentEvent) {
  const s = useSessions.getState();
  switch (ev.type) {
    case 'state':
      s.setState(sessionId, ev.value);
      break;
    case 'plan':
      s._patchAgentTurn(sessionId, turnId, { plan: ev.items });
      break;
    case 'plan-item':
      s._updatePlanItem(sessionId, turnId, ev.itemId, { status: ev.status });
      break;
    case 'diff':
      s._setDiff(sessionId, turnId, ev.diff);
      break;
    case 'log':
      s._appendLog(sessionId, turnId, ev.line);
      break;
    case 'thought':
      s._patchAgentTurn(sessionId, turnId, { thoughtFor: ev.seconds });
      break;
    case 'files-touched':
      s._patchAgentTurn(sessionId, turnId, { filesTouched: ev.count });
      break;
    case 'await-approval':
      // Drive plan items to "running" so the UI shows momentum once approved.
      s.setState(sessionId, 'PLAN');
      break;
    case 'done':
      s.setState(sessionId, 'LIVE');
      s._patchAgentTurn(sessionId, turnId, { ranToCompletion: true });
      // Mark any still-pending plan items as done.
      const turn = useSessions
        .getState()
        .sessions[sessionId]?.turns.find((t) => t.id === turnId);
      if (turn?.kind === 'agent') {
        for (const p of turn.plan) {
          if (p.status !== 'done') {
            s._updatePlanItem(sessionId, turnId, p.id, { status: 'done' });
          }
        }
      }
      break;
    case 'error':
      emitError(sessionId, turnId, ev.message);
      break;
  }
}

function emitError(sessionId: string, turnId: string, message: string) {
  const s = useSessions.getState();
  s._appendLog(sessionId, turnId, {
    prefix: '✗',
    prefixTone: 'rose',
    text: `error: ${message}`.slice(0, 200),
    tone: 'rose',
  });
  s.setState(sessionId, 'IDLE');
}

// ─── SSE pump ────────────────────────────────────────────

async function pumpSse(
  body: ReadableStream<Uint8Array>,
  onEvent: (ev: AgentEvent) => void,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buf = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop() ?? '';
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload) continue;
      try {
        const ev = JSON.parse(payload) as AgentEvent;
        onEvent(ev);
      } catch {
        // ignore malformed
      }
    }
  }
}

function isAbort(err: unknown): boolean {
  return (
    err instanceof DOMException && err.name === 'AbortError'
  ) || (typeof err === 'object' && err != null && (err as { name?: string }).name === 'AbortError');
}

function errMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return String(err);
}
