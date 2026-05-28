# Lucid Terminal

A voice-first mobile coding agent. Hold the mic, say what you want, watch
Claude plan + write + ship code on a phone-shaped terminal UI.

Next.js 14 + TypeScript + Tailwind + Zustand. Web-first build of an app whose
shape is mobile-app-native — see `tasks/README.md` and `design-asset/PROMPT.md`
for the design rules.

## Setup

```sh
pnpm install
cp .env.local.example .env.local      # then paste your ANTHROPIC_API_KEY
pnpm dev
```

Open `http://localhost:3000`. Pick a repo from `/repos`, hold the mic on
`/session`, say what to build.

### `ANTHROPIC_API_KEY`

The server-side agent loop in `app/api/agent/run/route.ts` uses
[`@anthropic-ai/claude-agent-sdk`](https://github.com/anthropics/claude-agent-sdk-typescript)
to drive Claude with read/edit/bash tool access. It needs an Anthropic API key
in `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Without it, submitting a turn surfaces an inline `error: ANTHROPIC_API_KEY is
not set on the server.` line in the session log — the UI doesn't crash.

Optional: set `CLAUDE_AGENT_MODEL` (defaults to `claude-opus-4-7`).

### Demo repos

The picker in `/repos` points at directories under `demo-repos/`, which is
gitignored. A starter scaffold for `idea-garden` ships in this repo; clone or
hand-build the others if you want to use them. Each row in
`lib/mock-data.ts` has a `path` the route handler `cd`s into.

## Architecture

```
Client (browser)              Server (Next.js route handler)
─────────────────             ──────────────────────────────
useSession                    POST /api/agent/run
  └─ submitTurn()  ─────────► spawn @anthropic-ai/claude-agent-sdk
                              stream assistant + tool events → SSE
  ◄────── SSE events ───────  { state | plan | diff | log | done | error }
patchAgentTurn(...)
appendLog(...)
setDiff(...)
setState(...)
```

The route handler intercepts the agent's first file-modifying tool call via
`canUseTool` and parks it on an in-memory bus until the client POSTs
`/api/agent/approve`. The bus is process-local, so a page reload during an
approval gate cancels the run — the UI keeps the chip honest, but the user has
to re-prompt to get a real continuation.
