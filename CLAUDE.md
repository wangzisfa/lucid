# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Lucid Terminal: a voice-first mobile coding agent. Hold the mic, say what you want, watch Claude plan / approve / write / ship inside a phone-shaped terminal UI. Next.js 14 (App Router) + TypeScript + Tailwind + Zustand, with `@anthropic-ai/claude-agent-sdk` driving the real agent loop on the server.

The web stack is the host, but the **shape** of the code is mobile-app-native — the goal is for a future React Native / Expo port to be a translation, not a rewrite. See `design-asset/PROMPT.md` for the full visual brief and `tasks/README.md` for the build-order rules every screen follows.

## Commands

```sh
pnpm install
cp .env.local.example .env.local      # paste ANTHROPIC_API_KEY
pnpm dev                              # next dev on :3000
pnpm build                            # next build (typecheck enforced, lint skipped)
pnpm start                            # next start on :3000
pnpm lint                             # next lint
pnpm typecheck                        # tsc --noEmit
```

Env: `ANTHROPIC_API_KEY` is required for `/api/agent/run`; without it the SSE stream emits a single `error` event and the UI shows it inline (no crash). `CLAUDE_AGENT_MODEL` overrides the model (defaults to `claude-opus-4-7`).

`next.config.js` sets `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: false` — `pnpm build` enforces types but not lint. Run `pnpm typecheck` + `pnpm lint` separately.

### Debug + design routes

- `/debug/run` — bypass mic and step the agent loop with buttons; renders the raw `useSessions` store trace. Use this first when something looks wrong in the store.
- `/design` — internal status board listing every screen (01–16) against the design spec.

Demo repos under `demo-repos/` are **gitignored**. Only `idea-garden` is scaffolded in this repo; clone or hand-build the others if you want the picker rows in `lib/mock-data.ts` to point at real directories. The server-side runner `cd`s into `repos/page.tsx` row's `path` (resolved under `PROJECT_ROOT`) for each turn.

## Architecture

### Client ↔ server agent loop

```
Client (browser)              Server (Next.js route handler)
─────────────────             ──────────────────────────────
useSessions                   POST /api/agent/run  (SSE)
  └─ submitTurn()  ─────────► spawn @anthropic-ai/claude-agent-sdk query()
                              canUseTool intercepts first mutating tool
                              blocks on lib/agent-approval-bus
  ◄────── SSE events ───────  { state | plan | plan-item | diff |
                                log | thought | files-touched |
                                await-approval | done | error }

approveLatestPlan() ────────► POST /api/agent/approve  (releases bus)
```

The approval bus (`lib/agent-approval-bus.ts`) is a **process-local `Map<sessionId, resolver>`**. A page reload tears down the SSE request, the runner dies, and there is no way to re-attach — `runAgentScript({ resumeFromTurnId })` and `resumeAwaitingApprovals()` only keep the chip honest; the user must re-prompt to get a real continuation. Don't try to add resume-across-reload without addressing this.

Wire format between server and client is `lib/agent-events.ts` (`AgentEvent` union). Server emits, client unwraps in `lib/agent-runner.ts` `handleEvent()` and calls the matching `useSessions` action (`_appendLog`, `_setDiff`, `_patchAgentTurn`, …). Keep that mapping symmetric when adding new event types.

In `app/api/agent/run/route.ts`:
- `READ_ONLY_TOOLS` (Read/Glob/Grep/WebFetch/WebSearch) are always allowed.
- `MUTATING_TOOLS` (Edit/Write/MultiEdit/Bash/NotebookEdit) trigger `await-approval` on first call and block on `waitForApproval(sessionId, abortSignal)`. Once approved, subsequent mutating tools pass through for the rest of the turn.
- The route's `APPEND_SYSTEM_PROMPT` instructs the model to emit `<plan><item label="..." comment="..."/></plan>` XML; `flushPlanFromText` parses that (or a numbered-list fallback) and emits `plan` + `state: PLAN` events.
- `diffFromToolInput` synthesizes the diff from `Edit`/`Write`/`MultiEdit` inputs **before** the tool runs, so the UI sees the diff even if the tool fails.

### State: Zustand, multi-session

`lib/store.ts` is the source of truth. Three principles, in priority order:

1. **All cross-screen state lives in Zustand.** No React Context for app data — Context is reserved for things like `PhoneRootContext` (DOM ref for portals). The Zustand stores are the substrate the future RN port will reuse (same API, `AsyncStorage` backend).
2. **Routes are screens, not URLs.** Refreshing `/session` does not lose history. `persist` middleware writes to `localStorage` under versioned keys (`lucid:sessions:v2`, `lucid:settings:v1`); on rehydrate, `dropGhostTurns` strips in-flight turns with no plan and `chipFromHistory` recomputes the chip so it never lies.
3. **Background tasks live in the store, not the screen.** Agent runs are driven by `runAgentScript()` writing into `useSessions`; `SessionScreen` only subscribes. Switching to `/agents` mid-run does not pause the run.

`useSessions` is the canonical hook; prefer the selector helpers (`useActiveSession`, `useActiveSessionId`, `useSessionList`, `useLiveCount`) over `useSessions(s => …)` ad-hoc. `useSessionList` uses `useShallow` because the selector returns a fresh array — without it, Zustand v5's `Object.is` equality treats every render as a new snapshot and infinite-loops. Follow the same pattern for any new list selector.

Internal actions are prefixed `_` (`_appendTurn`, `_patchAgentTurn`, `_updatePlanItem`, `_appendLog`, `_setDiff`). The runner calls these directly; UI code should never reach for them.

Other stores: `useSettings` (`lib/settings-store.ts`) with TOML round-trip in `lib/lucidrc.ts`; `useFiles` (`lib/files-store.ts`) for the file-tree screen cursor.

### Screens, orientation, and the phone frame

Every route renders inside `<ScreenStage><…Screen/></ScreenStage>`. The screen mounts a `<TermPhone>` (320×660 portrait) or `<LandTermPhone>` (660×320 landscape) — these draw the gradient/grid/scanlines/ember chrome and expose their outer element via `PhoneRootContext` so modals can portal above all in-phone z-indexes.

`SessionScreen` is the only place orientation dispatch lives: it reads `useOrientation()` and returns `<LandSessionScreen/>` in landscape, `<PortraitSessionScreen/>` otherwise. State survives the swap because both render from the same `useActiveSession()`.

Phone framing rule: framed (rounded 320×660 / 660×320 demo card) on desktop, fullbleed on `≤480px`. `useIsMobile()` is the breakpoint check; in fullbleed mode the simulated iOS status bar / home indicator hide and content gets `env(safe-area-inset-*)` padding so the real notch doesn't overlap.

### Voice capture

`lib/useVoice.ts` is press-and-hold, scoped to the **session active at `start()` time** (captured in `targetSessionId.current`). Switching sessions mid-recording does not redirect the in-flight transcript. Uses Web Speech API when available (`SpeechRecognition` / `webkitSpeechRecognition`); otherwise falls back to a timer + canned transcript so the plan/approve/run loop is still reachable in unsupported browsers.

## Conventions (must follow)

These are repeated across every task prompt in `tasks/`. Honor them or future tasks will conflict with your code.

- **Gestures, not clicks.** `onPointerDown/Move/Up/Cancel` everywhere — never `onMouseDown`. Put `touch-action: none` on draggable elements.
- **Safe area via `env(safe-area-inset-*)`**, never fixed px. The CSS vars `--safe-top/right/bottom/left` are exposed in `globals.css`.
- **Keyboard-aware bottom bar.** Shift the input above `visualViewport.height` when the keyboard is up (`lib/useViewportBottom.ts`).
- **One viewport.** Use `<TermPhone>` / `<LandTermPhone>` — don't render full-page content; everything sits inside the phone frame.
- **Persist with version bumps.** When you change a store's shape, bump the persist `version` and use a new `name` (e.g. `lucid:foo:v2`) so old data doesn't poison the new shape.
- **No emoji.** ASCII glyphs + the mono icon set in `components/icons.tsx`. Plan items render as `[/]` done / `[●]` running / `[ ]` pending.
- **Dark only.** No light mode, no theme switcher.
- **Design tokens are the only colors.** Use CSS vars from `app/globals.css` (`--rose`, `--cyan`, `--mint`, `--amber`, `--violet`, `--text-hi/mid/lo/disabled`, `--bg-deep/cosmos`). Don't invent hex values. One accent per screen, max two.
- **Mono font by default.** `var(--font-mono)` for bodies, lists, code, diffs, logs. `var(--font-display)` (Instrument Serif) only for the wordmark / transcription quote. `var(--font-sans)` for UI labels.
- **Path alias `@/*`** maps to repo root (see `tsconfig.json`). Use it instead of relative `../../../` chains.

## When you change the agent loop

`lib/agent-runner.ts` and `app/api/agent/run/route.ts` are the two halves of the same machine — almost any change to one needs a matching change to the other. The contract between them is `AgentEvent` in `lib/agent-events.ts`. If you add an event type, add it to the union, emit it from the route, handle it in `handleEvent`, and route it to a `useSessions` action. Don't smuggle data through `log` lines as a shortcut.

If you add a tool to `READ_ONLY_TOOLS` or `MUTATING_TOOLS`, update `preToolLog` and `diffFromToolInput` so the UI still shows momentum and a diff preview.
