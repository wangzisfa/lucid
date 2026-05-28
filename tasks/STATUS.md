# Sub-task status

Append a line as each task lands. Use this as the merge-coordination log.

- [x] **sprint 1+2** — boot · repos · session · hold-mic · plan · approve · run · preview
- [x] task-0 — foundation landed @ (pending commit) · viewport · safe-area · persist · PWA · orientation · resume-runner
- [x] task-A — files screen landed @ (pending commit)
- [x] task-B — multi-agent landed @ (pending commit) · store refactor (`useSessions` + `useActiveSession` + `useSessionList` + `useLiveCount`) · agents screen · spawn flow · per-session greek id + name · `${N} LIVE` chip · persist v2 (`lucid:sessions:v2`)
- [x] task-C — settings landed @ (pending commit) · hub · providers · model · raw · `useSettings` persist · Toggle/Stepper/TermBar primitives · TOML round-trip
- [x] task-D — landscape landed @ (pending commit) · `<LandTermPhone>` (660×320 + island/safe-area) · `<PaneSplit>` (drag + Esc reset + min 15%) · `<Pane>` · `<LandAppBar>` · `<LandBottomBar>` · 09 PLAN│CODE│PREVIEW · 10 listening hero · 11 SHELL│PREVIEW│DIFF · SessionScreen dispatches by `useOrientation()`
- [x] task-E — real Claude landed @ (pending commit) · `@anthropic-ai/claude-agent-sdk` server-side · `app/api/agent/run` SSE route with `canUseTool` approval gate · `app/api/agent/approve` · `lib/agent-approval-bus.ts` process-local bus · `Repo.path` + `demo-repos/idea-garden` scaffold · `lib/agent-runner.ts` rewritten as SSE consumer (store API unchanged)

## Notes for next sessions

**Task B (multi-agent):** Task 0 added `persist` to the singular `useSession` under key `lucid:session:v1`. When you refactor to multi-session, bump persist version to `v2` and use a different storage key (`lucid:sessions:v2`) so old singular-session data doesn't poison the new shape.

**Task D (landscape):** `useOrientation()` is at [lib/orientation.ts](../lib/orientation.ts). `<TermPhone>` now auto-detects mobile width via `useIsMobile()` ([lib/useIsMobile.ts](../lib/useIsMobile.ts)) and goes fullbleed below 480px. You'll likely want a parallel `<LandTermPhone>` that does the same. Read from `useActiveSession()` for the session being shown; per-pane behavior should follow the same selectors used by [components/screens/SessionScreen.tsx](../components/screens/SessionScreen.tsx).

**Task E (real Claude):** [lib/agent-runner.ts](../lib/agent-runner.ts) now takes `sessionId` on every entry point. `runAgentScript({ sessionId, userText })` for fresh runs, `runAgentScript({ sessionId, resumeFromTurnId })` for resume, `resumeAwaitingApprovals()` iterates **all** sessions. When you swap in the real SDK, keep the same emitter API (use `useSessions.getState()._patchAgentTurn`, `_setDiff`, `_appendLog`, etc.) and the existing UI doesn't need to change. The SSE route can multiplex events keyed by `sessionId`.

**Task E (real Claude):** the agent runner now exports `resumeAwaitingApprovals()` and supports `runAgentScript({ resumeFromTurnId })` — if you keep the same approval gate semantics, the SessionScreen hook already calls resume on mount.

## Conflicts

- B and E both touch `lib/agent-runner.ts` — sequence them.
- D depends on Task 0's `useOrientation()` — if 0 ships first, just import; otherwise stub.
