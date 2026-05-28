import path from 'node:path';
import fs from 'node:fs';
import type { NextRequest } from 'next/server';
import { query, type PermissionResult } from '@anthropic-ai/claude-agent-sdk';
import type { AgentEvent } from '@/lib/agent-events';
import type { PlanItem, AgentDiff, LogLine } from '@/lib/types';
import { waitForApproval } from '@/lib/agent-approval-bus';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROJECT_ROOT = process.cwd();
const MODEL = process.env.CLAUDE_AGENT_MODEL || 'claude-opus-4-7';

// The mobile shell calls this route cross-origin (from capacitor://localhost /
// https://localhost), so the streaming fetch and its JSON preflight need CORS.
const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400',
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

const APPEND_SYSTEM_PROMPT = `
You are the agent behind Lucid Terminal — a voice-first mobile coding assistant.
The user gave you a short prompt (often a single sentence from voice) and a
working directory pointing at one of their projects.

Your job, in order:

1. Briefly explore the repo with Read / Glob / Grep to ground yourself.
2. Output a plan in EXACTLY this XML format, with 3-6 short imperative items.
   Each <item> label should be a short verb phrase (e.g. "create
   ReflectionCard.tsx", "wire chime hook"). Each <comment> is optional and is
   the file path or quick note that goes with the item.

   <plan>
     <item label="..." comment="..." />
     <item label="..." />
   </plan>

3. Once the plan is approved (this happens behind your back — the next tool
   call will simply succeed once the human taps APPROVE) carry out the plan.
4. When you finish, give a one-sentence wrap-up. Don't ask follow-up questions.

Keep prose tight. The user sees this on a phone-shaped terminal UI. Prefer
short shell-style log lines over essays.
`.trim();

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { sessionId?: string; userText?: string; repoPath?: string; apiKey?: string }
    | null;

  const sessionId = body?.sessionId;
  const userText = (body?.userText || '').trim();
  const repoPath = body?.repoPath;

  if (!sessionId || !userText || !repoPath) {
    return new Response(
      JSON.stringify({ error: 'sessionId, userText and repoPath are required' }),
      { status: 400, headers: { 'content-type': 'application/json', ...CORS_HEADERS } },
    );
  }

  const repoAbs = path.resolve(PROJECT_ROOT, repoPath);
  if (!repoAbs.startsWith(PROJECT_ROOT) || !fs.existsSync(repoAbs)) {
    return new Response(
      JSON.stringify({ error: `repoPath ${repoPath} not found` }),
      { status: 400, headers: { 'content-type': 'application/json', ...CORS_HEADERS } },
    );
  }

  // BYOK: prefer the per-request key from the client, fall back to the server
  // env. The key is handed to the agent subprocess via `options.env` below.
  const apiKey = body?.apiKey?.trim() || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return sseError(
      'No API key. Set one in Settings › providers, or ANTHROPIC_API_KEY on the server.',
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      runAgent({ sessionId, userText, repoAbs, apiKey, controller, signal: req.signal }).catch(
        (err) => {
          emit(controller, {
            type: 'error',
            message: errMessage(err),
          });
          safeClose(controller);
        },
      );
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
      ...CORS_HEADERS,
    },
  });
}

interface RunCtx {
  sessionId: string;
  userText: string;
  repoAbs: string;
  apiKey: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
  signal: AbortSignal;
}

async function runAgent(ctx: RunCtx) {
  const { sessionId, userText, repoAbs, apiKey, controller, signal } = ctx;
  const t0 = Date.now();
  let planEmitted = false;
  let approved = false;
  let awaitingApproval = false;
  let textBuffer = '';
  const touchedFiles = new Set<string>();

  const abortController = new AbortController();
  const onUpstreamAbort = () => abortController.abort();
  if (signal.aborted) abortController.abort();
  else signal.addEventListener('abort', onUpstreamAbort, { once: true });

  emit(controller, { type: 'state', value: 'GEN' });

  const canUseTool = async (
    toolName: string,
    input: Record<string, unknown>,
  ): Promise<PermissionResult> => {
    // Read-only tools always pass.
    if (READ_ONLY_TOOLS.has(toolName)) return { behavior: 'allow' };

    // First time we see a mutating tool, ask the user.
    if (!approved && MUTATING_TOOLS.has(toolName)) {
      awaitingApproval = true;
      // Flush any plan we've been able to parse so the UI has something to show.
      if (!planEmitted) flushPlanFromText(textBuffer, controller, () => (planEmitted = true));
      emit(controller, { type: 'state', value: 'PLAN' });
      emit(controller, { type: 'await-approval' });
      const ok = await waitForApproval(sessionId, abortController.signal);
      awaitingApproval = false;
      if (!ok) {
        return {
          behavior: 'deny',
          message: 'User did not approve. Stop and explain briefly what you would have done.',
          interrupt: true,
        };
      }
      approved = true;
      emit(controller, { type: 'state', value: 'GEN' });
    }

    // Pre-emit a log line for the action so the UI shows momentum, even before
    // the tool finishes.
    const log = preToolLog(toolName, input);
    if (log) emit(controller, { type: 'log', line: log });

    // For Edit/Write we can compute and emit a diff up front from the input.
    const diff = diffFromToolInput(toolName, input, repoAbs);
    if (diff) {
      emit(controller, { type: 'diff', diff });
      touchedFiles.add(diff.path);
      emit(controller, { type: 'files-touched', count: touchedFiles.size });
    }

    return { behavior: 'allow' };
  };

  const q = query({
    prompt: userText,
    options: {
      cwd: repoAbs,
      model: MODEL,
      systemPrompt: { type: 'preset', preset: 'claude_code', append: APPEND_SYSTEM_PROMPT },
      allowedTools: [...READ_ONLY_TOOLS, ...MUTATING_TOOLS],
      canUseTool,
      permissionMode: 'default',
      abortController,
      includePartialMessages: false,
      // `env` REPLACES the subprocess environment, so spread process.env to keep
      // PATH/HOME etc., then inject the resolved (BYOK or server) key.
      env: { ...process.env, ANTHROPIC_API_KEY: apiKey },
    },
  });

  try {
    for await (const msg of q) {
      if (signal.aborted) break;

      switch (msg.type) {
        case 'system':
          // init / status — not user-visible.
          break;

        case 'assistant': {
          for (const block of msg.message.content) {
            if (block.type === 'text') {
              textBuffer += '\n' + block.text;
              if (!planEmitted) {
                flushPlanFromText(textBuffer, controller, () => (planEmitted = true));
              } else {
                // Surface model prose as a log line (only the last segment).
                const lines = block.text.split('\n').filter((l) => l.trim().length > 0);
                for (const line of lines.slice(0, 3)) {
                  emit(controller, {
                    type: 'log',
                    line: { prefix: '›', prefixTone: 'rose', text: line, tone: 'mid' },
                  });
                }
              }
            }
          }
          break;
        }

        case 'user': {
          // tool_result coming back from a tool the agent invoked.
          const content = msg.message.content;
          const blocks = typeof content === 'string' ? [] : asArray(content);
          for (const block of blocks) {
            if (block.type === 'tool_result') {
              const text = toolResultText(block.content);
              if (text) {
                const lines = text.split('\n').slice(0, 4);
                for (const l of lines) {
                  if (!l.trim()) continue;
                  emit(controller, {
                    type: 'log',
                    line: {
                      prefix: block.is_error ? '✗' : '→',
                      prefixTone: block.is_error ? 'rose' : 'cyan',
                      text: l.trim().slice(0, 160),
                      tone: block.is_error ? 'rose' : 'mid',
                    },
                  });
                }
              }
            }
          }
          break;
        }

        case 'result': {
          const seconds = Math.max(0.1, Math.round((Date.now() - t0) / 100) / 10);
          emit(controller, { type: 'thought', seconds });

          if (msg.subtype === 'success') {
            emit(controller, { type: 'state', value: 'LIVE' });
            emit(controller, { type: 'done' });
          } else {
            emit(controller, {
              type: 'error',
              message: `Agent finished with ${msg.subtype}`,
            });
          }
          break;
        }
      }
    }
  } finally {
    safeClose(controller);
    signal.removeEventListener('abort', onUpstreamAbort);
    if (awaitingApproval) {
      // Make sure the bus releases if the connection dies while we were
      // blocked on canUseTool.
      abortController.abort();
    }
  }
}

const READ_ONLY_TOOLS = new Set(['Read', 'Glob', 'Grep', 'WebFetch', 'WebSearch']);
const MUTATING_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'Bash', 'NotebookEdit']);

function preToolLog(toolName: string, input: Record<string, unknown>): LogLine | null {
  if (toolName === 'Bash') {
    const cmd = typeof input.command === 'string' ? input.command : '';
    return { prefix: '$', prefixTone: 'lo', text: cmd.slice(0, 160), tone: 'lo' };
  }
  if (toolName === 'Write') {
    const fp = typeof input.file_path === 'string' ? input.file_path : '';
    return { prefix: '✎', prefixTone: 'cyan', text: `write ${shortPath(fp)}`, tone: 'cyan' };
  }
  if (toolName === 'Edit' || toolName === 'MultiEdit') {
    const fp = typeof input.file_path === 'string' ? input.file_path : '';
    return { prefix: '✎', prefixTone: 'cyan', text: `edit ${shortPath(fp)}`, tone: 'cyan' };
  }
  if (toolName === 'Read') {
    const fp = typeof input.file_path === 'string' ? input.file_path : '';
    return { prefix: '·', prefixTone: 'lo', text: `read ${shortPath(fp)}`, tone: 'lo' };
  }
  if (toolName === 'Glob' || toolName === 'Grep') {
    const pat = typeof input.pattern === 'string' ? input.pattern : '';
    return { prefix: '?', prefixTone: 'lo', text: `${toolName.toLowerCase()} ${pat}`, tone: 'lo' };
  }
  return null;
}

function diffFromToolInput(
  toolName: string,
  input: Record<string, unknown>,
  repoAbs: string,
): AgentDiff | null {
  const filePath =
    typeof input.file_path === 'string' ? (input.file_path as string) : null;
  if (!filePath) return null;

  if (toolName === 'Write') {
    const content = typeof input.content === 'string' ? (input.content as string) : '';
    const existing = readSafe(filePath, repoAbs);
    if (existing == null) {
      const lines = content.split('\n');
      return {
        path: shortPath(filePath),
        added: lines.length,
        removed: 0,
        lines: lines.slice(0, 40).map((text) => ({ kind: '+' as const, text })),
      };
    }
    return computeDiff(shortPath(filePath), existing, content);
  }

  if (toolName === 'Edit') {
    const oldStr = typeof input.old_string === 'string' ? (input.old_string as string) : '';
    const newStr = typeof input.new_string === 'string' ? (input.new_string as string) : '';
    return computeEditDiff(shortPath(filePath), oldStr, newStr);
  }

  if (toolName === 'MultiEdit') {
    const edits = Array.isArray((input as { edits?: unknown }).edits)
      ? ((input as { edits: Array<{ old_string?: string; new_string?: string }> }).edits)
      : [];
    let added = 0;
    let removed = 0;
    const lines: AgentDiff['lines'] = [];
    for (const e of edits) {
      const o = (e.old_string ?? '').split('\n');
      const n = (e.new_string ?? '').split('\n');
      removed += o.length;
      added += n.length;
      for (const l of o.slice(0, 4)) lines.push({ kind: '-' as const, text: l });
      for (const l of n.slice(0, 4)) lines.push({ kind: '+' as const, text: l });
    }
    return { path: shortPath(filePath), added, removed, lines: lines.slice(0, 40) };
  }

  return null;
}

function computeEditDiff(displayPath: string, oldStr: string, newStr: string): AgentDiff {
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  const lines: AgentDiff['lines'] = [
    ...oldLines.map((text) => ({ kind: '-' as const, text })),
    ...newLines.map((text) => ({ kind: '+' as const, text })),
  ];
  return {
    path: displayPath,
    added: newLines.length,
    removed: oldLines.length,
    lines: lines.slice(0, 40),
  };
}

function computeDiff(displayPath: string, oldText: string, newText: string): AgentDiff {
  if (oldText === newText) {
    return { path: displayPath, added: 0, removed: 0, lines: [] };
  }
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  return {
    path: displayPath,
    added: newLines.length,
    removed: oldLines.length,
    lines: newLines.slice(0, 40).map((text) => ({ kind: '+' as const, text })),
  };
}

function readSafe(filePath: string, repoAbs: string): string | null {
  try {
    const abs = path.isAbsolute(filePath) ? filePath : path.resolve(repoAbs, filePath);
    if (!abs.startsWith(repoAbs)) return null;
    if (!fs.existsSync(abs)) return null;
    return fs.readFileSync(abs, 'utf8');
  } catch {
    return null;
  }
}

function shortPath(p: string): string {
  if (!p) return '';
  const idx = p.lastIndexOf('/');
  if (idx < 0) return p;
  const tail = p.slice(idx + 1);
  const parent = p.slice(0, idx);
  const parentTail = parent.split('/').slice(-2).join('/');
  return `~/${parentTail}/${tail}`;
}

function flushPlanFromText(
  text: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  onFlushed: () => void,
) {
  const items = parsePlanXml(text) ?? parseNumberedPlan(text);
  if (!items || items.length === 0) return;
  emit(controller, { type: 'plan', items });
  emit(controller, { type: 'state', value: 'PLAN' });
  onFlushed();
}

function parsePlanXml(text: string): PlanItem[] | null {
  const planMatch = text.match(/<plan>([\s\S]*?)<\/plan>/i);
  if (!planMatch) return null;
  const body = planMatch[1];
  const itemRegex = /<item\s+([^/>]*)\/?>/g;
  const items: PlanItem[] = [];
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = itemRegex.exec(body)) !== null) {
    const attrs = m[1];
    const label = attrAt(attrs, 'label');
    const comment = attrAt(attrs, 'comment');
    if (!label) continue;
    items.push({
      id: `p${++i}`,
      label,
      comment: comment || undefined,
      status: 'pending',
    });
  }
  return items.length > 0 ? items : null;
}

function attrAt(attrs: string, name: string): string | null {
  const m = new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i').exec(attrs);
  return m ? m[1] : null;
}

function parseNumberedPlan(text: string): PlanItem[] | null {
  // Fallback: lines starting with "1.", "2." or "- " in the first 30 lines.
  const lines = text.split('\n').slice(0, 60);
  const items: PlanItem[] = [];
  let i = 0;
  for (const raw of lines) {
    const line = raw.trim();
    const m = /^(?:\d+[.)]|[-*])\s+(.{4,140}?)$/.exec(line);
    if (m) {
      items.push({
        id: `p${++i}`,
        label: m[1].replace(/[`*]/g, '').trim(),
        status: 'pending',
      });
    }
    if (items.length >= 6) break;
  }
  return items.length >= 2 ? items : null;
}

function toolResultText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((c: unknown) =>
        typeof c === 'object' && c && 'text' in c && typeof (c as { text: unknown }).text === 'string'
          ? (c as { text: string }).text
          : '',
      )
      .join('\n');
  }
  return '';
}

function asArray<T>(v: T | T[]): T[] {
  return Array.isArray(v) ? v : [v];
}

function emit(controller: ReadableStreamDefaultController<Uint8Array>, ev: AgentEvent) {
  try {
    const data = `data: ${JSON.stringify(ev)}\n\n`;
    controller.enqueue(new TextEncoder().encode(data));
  } catch {
    // controller already closed
  }
}

function safeClose(controller: ReadableStreamDefaultController<Uint8Array>) {
  try {
    controller.close();
  } catch {
    // already closed
  }
}

function sseError(message: string): Response {
  const enc = new TextEncoder();
  const body = `data: ${JSON.stringify({ type: 'error', message })}\n\n`;
  return new Response(enc.encode(body), {
    headers: { 'content-type': 'text/event-stream', ...CORS_HEADERS },
  });
}

function errMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return String(err);
}
