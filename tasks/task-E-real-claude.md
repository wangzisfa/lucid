# Task E — Replace mock with real Claude Agent SDK

> **MUST land after Task B**. Both touch `lib/agent-runner.ts`. Rebase / re-implement on top of Task B's multi-session signature.

## Context

You're swapping the mock agent for a real `@anthropic-ai/claude-agent-sdk`-backed loop in **Lucid Terminal**, a voice-first mobile coding agent. Stack: Next.js 14 + TS + Tailwind + Zustand. Repo: `/Users/bytedance/Desktop/Dev/lucid`. Read `design-asset/PROMPT.md` (especially §2 on the SDK and §8 acceptance criteria) and `design-asset/SCREENS.md`.

This is a **web-first build of a mobile app**. Follow the mobile-architecture rules in `tasks/README.md`. The agent has to be **server-side** — we cannot leak the API key into client bundles. So your runner orchestrates a Next.js Route Handler over Server-Sent Events.

## Goal

Replace `runAgentScript()` (currently scripted plan→diff→log) with a real Claude agent that:

- Receives the user's voice transcript or text prompt
- Plans a multi-step task against the user's chosen demo repo
- Surfaces planning + tool calls + edits + shell output into the existing session store, so the UI doesn't need to change

The user's voice/text loop, plan-approval gate, preview iframe, etc. all stay. The agent is the only thing changing.

## Architecture

```
Client (browser)            Server (Next.js route handler)
─────────────────           ────────────────────────────────
useSession                  POST /api/agent/run
  └─ submitTurn() ────────► spawn claude-agent-sdk Session
                            stream tool events → SSE
  ◄────────────── SSE ──────  emit { type, payload }
patchAgentTurn(...)
appendLog(...)
setDiff(...)
setState(...)
```

### Server route

`app/api/agent/run/route.ts` — `POST` handler accepting:

```ts
{ sessionId: string; userText: string; repoPath: string }
```

Returns SSE stream. Each event has shape:

```ts
type AgentEvent =
  | { type: 'state'; value: 'GEN' | 'PLAN' | 'LIVE' }
  | { type: 'plan'; items: { id: string; label: string; comment?: string }[] }
  | { type: 'plan-item'; itemId: string; status: 'done' | 'running' | 'pending' }
  | { type: 'diff'; path: string; added: number; removed: number; lines: { kind: '+'|'-'|' '; text: string }[] }
  | { type: 'log'; line: { prefix?: string; text: string; tone?: 'lo'|'mid'|'hi'|'mint'|'cyan'|'rose' } }
  | { type: 'await-approval'; planId: string }
  | { type: 'done' }
  | { type: 'error'; message: string };
```

Use `@anthropic-ai/claude-agent-sdk` — spawn a session per request, pipe its tool use callbacks to event emit. Map agent tool calls (`bash`, `str_replace_editor`, `read_file`, `write_file`) to:
- `bash` invocations → `log` events
- `write_file` / `str_replace_editor` → compute diff and emit `diff` event
- the plan the agent outputs (use the `Plan` tool or a `<plan>` XML fence depending on what the SDK exposes) → emit `plan` event

Await-approval gate: emit `await-approval`, then **block until the client sends a second POST `/api/agent/approve/[planId]`** (or, simpler: open a parallel SSE for approval signals — your call).

### Client runner

Rewrite `lib/agent-runner.ts` to:

```ts
export async function runAgentScript({ sessionId, userText }: { sessionId: string; userText: string }) {
  const repo = useSessions.getState().sessions[sessionId].repo;
  const res = await fetch('/api/agent/run', {
    method: 'POST',
    body: JSON.stringify({ sessionId, userText, repoPath: pathFor(repo) }),
  });
  const reader = res.body!.getReader();
  // SSE-parse loop → call useSessions.getState() actions accordingly
}
```

Use the same store mutations as the mock (`_patchAgentTurn`, `_updatePlanItem`, `_setDiff`, `_appendLog`). The store API does not change.

### Approval

`approveLatestPlan(sessionId)` POSTs to `/api/agent/approve` with the plan id. The server-side agent unblocks and resumes execution.

## Demo repo

Pick **one** real demo repo to ship — e.g. clone `idea-garden` into `demo-repos/idea-garden/` under the project root (gitignored). The route handler `cd`s into it. Pull the path map from `lib/mock-data.ts` (extend `Repo` with `path: string`).

## Files you'll create / edit

| Path | Op |
|---|---|
| `app/api/agent/run/route.ts` | new |
| `app/api/agent/approve/route.ts` | new |
| `lib/agent-runner.ts` | rewrite |
| `lib/types.ts` | extend (`Repo.path: string`) |
| `lib/mock-data.ts` | extend (real paths) |
| `.env.local.example` | new (`ANTHROPIC_API_KEY=`) |
| `demo-repos/idea-garden/` | new (gitignored, real next.js scaffold) |
| `.gitignore` | append `demo-repos/`, `.env.local` |
| `package.json` | add `@anthropic-ai/claude-agent-sdk` |
| `README.md` | document `ANTHROPIC_API_KEY` setup |

## Acceptance / ready check

`pnpm typecheck` clean, `pnpm dev` boots with `ANTHROPIC_API_KEY` in `.env.local`. Then:

1. Open `/repos`, pick `idea-garden`, in `/session` hold the mic and say "add a reflection card at 9pm with a soft chime."
2. Real Claude responds: state goes through `GEN`, you see actual planning text, plan tree appears with the model's real plan items (not the scripted ones). State enters `PLAN`.
3. Tap `[A] APPROVE PLAN` → agent resumes. Tool calls flow in: log shows real `$ ls`, `$ cat …` etc. Real `diff` events with the model's actual edits to `demo-repos/idea-garden/components/ReflectionCard.tsx`.
4. State enters `LIVE`. Open the `[P] PREVIEW` sheet — iframe still points at `/preview/reflection-card` (the mock target) **or** at a real `localhost:5173` if you got the agent to actually run `pnpm dev` in the demo repo. (Bonus, not required for ready.)
5. Run a follow-up turn ("make the chime softer at night") — agent picks up the existing repo state and edits the chime file.
6. Cancel mid-thinking: `/api/agent/run` SSE closes cleanly, no zombie processes.
7. With no `ANTHROPIC_API_KEY` set, hitting submit shows a clean error toast in the session, not a crash.

## Out of scope

- Replacing the mic / Web Speech API.
- Multi-repo cloning UI.
- Streaming the preview from the agent's own dev server (nice stretch; not required).
- Persisting transcripts to disk.

## Hand-off note

When done, append to `tasks/STATUS.md`:

```
- [x] task-E — real Claude landed @ <git sha>
```
