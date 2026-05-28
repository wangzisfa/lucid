# Task B — Multi-agent sessions (08)

> Heaviest refactor of the lot. **Must land before Task E** (Claude integration) — both touch `lib/agent-runner.ts`. Coordinate.

## Context

You're building parallel agent sessions for **Lucid Terminal**, a voice-first mobile coding agent. Stack: Next.js 14 + TS + Tailwind + Zustand. Repo: `/Users/bytedance/Desktop/Dev/lucid`. Read `design-asset/PROMPT.md` + `design-asset/SCREENS.md` + look at `design-asset/screens/08-agents.png` before starting.

This is a **web-first build of a mobile app**. Follow the mobile-architecture rules in `tasks/README.md` — Zustand state, pointer gestures, safe area, no emoji, dark only.

**Background**: the current store has one global session. You're going to refactor it into many sessions + an `activeSessionId`, then build the `08-agents` screen showing all of them at once.

## Goal

1. Refactor `useSession` so the store holds N concurrent agent sessions instead of one. Each session has its own repo, turns, plan, diff, log, state-chip.
2. Build `/agents` screen showing all live sessions. Switching between them swaps the active session shown in `/session`. Header shows `3 LIVE` chip if 3+ are running.
3. Spawn-new flow: tap `+ spawn new agent · hold mic, name it` → opens a fresh session, holds the mic, transcript becomes the session name.

## Store refactor

New shape:

```ts
interface SessionState {
  id: string;
  greekId: 'α' | 'β' | 'γ' | 'δ' | string;   // for the header chip in 08
  name: string;                                // user-given, e.g. 'reflection-card-9pm'
  repo: Repo;
  branch: string;
  state: SessionChipState;                     // (renamed from SessionState type — conflicts!)
  turns: Turn[];
  recElapsed: number;
  interim: string;
  createdAt: number;
}

interface SessionsStoreShape {
  sessions: Record<string, SessionState>;
  order: string[];                             // creation order
  activeId: string | null;
  spawnSession: (repo: Repo, name?: string) => string;  // returns id
  closeSession: (id: string) => void;
  setActive: (id: string) => void;
  // ...all the previous actions, but each takes `id` as first arg:
  finishVoiceTurn: (id: string, transcript: string, duration: number) => void;
  submitTextTurn: (id: string, text: string) => void;
  approveLatestPlan: (id: string) => void;
  // ...etc
}
```

Rename the existing `SessionState` type (the chip enum) to `SessionChipState` to avoid collision.

### Selector helpers (so consumers stay tidy)

```ts
// hook helpers in lib/store.ts
export const useActiveSession = () =>
  useSessions((s) => (s.activeId ? s.sessions[s.activeId] : null));

export const useSessionList = () =>
  useSessions((s) => s.order.map((id) => s.sessions[id]));
```

`SessionScreen.tsx`, `InputBar.tsx`, `AgentTurnView.tsx`, `useVoice.ts`, `agent-runner.ts` all need to be ported to take a session id (either via prop drilling from `SessionScreen` reading `useActiveSession()`, or via a `SessionIdContext`).

### Agent runner

`runAgentScript({ userText })` becomes `runAgentScript({ sessionId, userText })`. All store writes route through `sessionId`. The `waitForApproval` loop should subscribe and resolve only when that specific session's latest agent turn is approved.

## `/agents` screen

Match `design-asset/screens/08-agents.png`:

- Header chip `3 LIVE` (or `2 LIVE / 4 ALL`).
- List of cards, one per session, each with:
  - Greek letter badge (α β γ δ …) on left
  - Session name (rose accent for the active one)
  - State chip on right (GEN / WAIT / RUN / DONE), pulsing if active state
  - Last-log-line preview row with a `<BlockWave>` if working
- Tap a card → `setActive(id)`, navigate to `/session`.
- Bottom dashed "spawn new agent · hold mic, name it" row. Pointer-down on it starts a fresh session bound to `repos[0]` and starts recording; release commits the name = transcript.

## Files you'll create / edit

| Path | Op | Note |
|---|---|---|
| `lib/store.ts` | **rewrite** | new shape per above |
| `lib/agent-runner.ts` | edit | takes `sessionId` |
| `lib/useVoice.ts` | edit | takes a session id (from context or prop) |
| `lib/types.ts` | edit | rename `SessionState` → `SessionChipState` |
| `components/screens/SessionScreen.tsx` | edit | read from `useActiveSession`, redirect to `/agents` if `activeId === null` |
| `components/session/InputBar.tsx` | edit | scope to active session |
| `components/session/AgentTurnView.tsx` | edit | approval scoped to active session |
| `components/session/ListeningOverlay.tsx` | edit | reads active session's `recElapsed` / `interim` |
| `app/agents/page.tsx` | new | route stub |
| `components/screens/AgentsScreen.tsx` | new | the list |
| `components/agents/SpawnRow.tsx` | new | bottom dashed row |
| `app/debug/run/page.tsx` | edit | wire to active session, add a "spawn 3 demo agents" button |

## Acceptance / ready check

`pnpm typecheck` clean, `pnpm dev` boots, then:

1. `/agents` empty state shows just the spawn row.
2. Hit spawn row → routes to `/session` with a new fresh session; turns/plan empty; speak a turn → flows as before.
3. Go back to `/agents` → that session is listed.
4. Spawn a second; complete a different turn in it. Switch between them via `/agents` — each preserves its own history (turns don't merge).
5. With 3 sessions all in non-IDLE state simultaneously, the app-bar chip in `/session` reads `3 LIVE`.
6. Refresh the page mid-spawn — sessions all persist (Task 0 made the store persist; verify it persists the new shape too — bump the persist version key to `lucid:sessions:v2`).
7. Close (X) a session → it disappears from the list, and if it was active, `activeId` falls back to the most recent.

## Out of scope

- Real Claude integration (Task E).
- Files screen (Task A).
- Landscape (Task D).
- Per-session settings (just one global settings store, Task C).

## Hand-off note

When done, append to `tasks/STATUS.md`:

```
- [x] task-B — multi-agent landed @ <git sha>
```

And **notify whoever is running Task E** — they need to rebase on top of your `agent-runner.ts` changes.
