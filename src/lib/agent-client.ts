import { Platform } from 'react-native';
import EventSource from 'react-native-sse';
import { useSessions, newId } from './store';
import { useSettings } from './settings-store';
import { AgentTurn } from './types';
import type { AgentEvent } from './agent-events';

/**
 * Dev fallback for the agent server when the user hasn't set one yet. The
 * Android emulator reaches the host machine at 10.0.2.2; the iOS simulator
 * shares localhost. With the server running via `pnpm server:dev`, the app
 * works out of the box — no setup needed for the local happy path.
 */
const DEV_SERVER_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

/**
 * Base URL of the Lucid agent server (the standalone Next app in ./server).
 * The RN client can't run the agent loop on-device. Uses the user's configured
 * server url (Settings → providers), falling back to the local dev server.
 * Trailing slash trimmed so `${base}/api/...` is clean.
 */
export function agentApiBase(): string {
  const raw = useSettings.getState().providers.serverUrl?.trim() ?? '';
  return (raw || DEV_SERVER_URL).replace(/\/+$/, '');
}

/** Live SSE connections keyed by `sessionId:turnId`, so we can cancel them. */
const liveRunners = new Map<string, EventSource>();
const runnerKey = (sessionId: string, turnId: string) => `${sessionId}:${turnId}`;

/**
 * Drive a real Claude Agent SDK session on the remote server (via SSE) against
 * a specific session in the store.
 *
 *   - fresh run: pass `sessionId` + `userText`. Creates an agent turn, opens an
 *     SSE POST to `/api/agent/run`, and pipes server events into the store.
 *   - resume:    pass `sessionId` + `resumeFromTurnId`. The server-side process
 *     is gone after the app restarts, so this just keeps the chip honest; the
 *     user re-prompts to continue.
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
    store.setState(sessionId, 'PLAN');
    return;
  }

  const base = agentApiBase();
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

  const es = new EventSource(`${base}/api/agent/run`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      userText,
      repoPath: session.repo.path,
      apiKey: useSettings.getState().providers.anthropicKey.trim() || undefined,
    }),
    // We manage the stream lifetime ourselves; no auto-reconnect.
    pollingInterval: 0,
  });
  liveRunners.set(key, es);

  const cleanup = () => {
    es.removeAllEventListeners();
    es.close();
    liveRunners.delete(key);
  };

  es.addEventListener('message', (event) => {
    const payload = event.data;
    if (!payload) return;
    try {
      const ev = JSON.parse(payload) as AgentEvent;
      handleEvent(sessionId, turnId, ev);
      if (ev.type === 'done' || ev.type === 'error') cleanup();
    } catch {
      // ignore malformed frame
    }
  });

  es.addEventListener('error', (event) => {
    // A normal end-of-stream close also surfaces here; only report if the turn
    // never completed.
    const turn = useSessions
      .getState()
      .sessions[sessionId]?.turns.find((t) => t.id === turnId);
    const finished = turn?.kind === 'agent' && turn.ranToCompletion;
    if (!finished) {
      const msg =
        'type' in event && (event as { type?: string }).type === 'timeout'
          ? 'connection timed out'
          : 'connection to agent server failed';
      emitError(sessionId, turnId, msg);
    }
    cleanup();
  });
}

/** Cancel any in-flight runners for a session. */
export function cancelRunners(sessionId: string) {
  for (const [key, es] of liveRunners.entries()) {
    if (key.startsWith(`${sessionId}:`)) {
      es.removeAllEventListeners();
      es.close();
      liveRunners.delete(key);
    }
  }
}

/**
 * Re-attach the chip to any agent turn waiting on approval. Call on
 * session-screen mount. Real runners can't be resumed after an app restart, so
 * this only keeps the chip honest.
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
      s.setState(sessionId, 'PLAN');
      break;
    case 'done': {
      s.setState(sessionId, 'LIVE');
      s._patchAgentTurn(sessionId, turnId, { ranToCompletion: true });
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
    }
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
