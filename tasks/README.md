# Lucid Terminal — sub-task prompts

Six independent prompts. Copy each into a fresh Claude Code session run at the repo root.

**Repo:** `/Users/bytedance/Desktop/Dev/lucid` (Next.js 14 + TS + Tailwind + Zustand).
**Design assets:** `design-asset/` (read `PROMPT.md` and `SCREENS.md` first).
**What's already built (Sprint 1 + 2):** boot → repos → session loop, hold-mic voice, plan/approve/run script, preview iframe. See `app/` and `components/` for the current shape.

---

## Order of execution

```
┌─ task-0-foundation        ← do first, all others assume it
│
├─ task-A-files             ┐
├─ task-B-multi-agent       │  can run in parallel after Task 0,
├─ task-C-settings          │  with one caveat:
├─ task-D-landscape         ┘
│
└─ task-E-real-claude       ← MUST land AFTER Task B
                              (both touch lib/agent-runner.ts)
```

If you run all in parallel: Task B and Task E will conflict on `lib/agent-runner.ts`. Sequence them.

---

## What "mobile-app architecture" means here

The web stack stays, but the **shape** of the code is mobile-app-native — so future RN/Expo port is a translation, not a rewrite. Every task prompt repeats these rules; honor them:

- **All state lives in Zustand stores.** No React Context for cross-screen data. Stores persist to localStorage. (RN swap: same API, AsyncStorage backend.)
- **Routes are screens, not URLs.** State survives navigation. Refreshing `/session` does not lose history.
- **Gestures, not clicks.** `onPointerDown/Move/Up/Cancel` everywhere. Never `onMouseDown`. `touch-action: none` on draggable elements.
- **Respect the safe area.** Padding via `env(safe-area-inset-*)` not fixed px.
- **One viewport.** Phone-shaped (320×660 portrait / 660×320 landscape) on desktop too. Use the existing `<TermPhone>` / `<LandTermPhone>` primitives.
- **Keyboard-aware bottom bar.** Bottom input shifts above `visualViewport.height` when keyboard is up.
- **Background tasks survive screen switches.** Agent runs live in the store, not the SessionScreen.
- **No emoji.** ASCII glyphs + the mono icon set in `components/icons.tsx`.
- **Dark only.** No theme switcher.

---

## Files

- [task-0-foundation.md](task-0-foundation.md) — viewport, safe-area, persistence, PWA, orientation hook
- [task-A-files.md](task-A-files.md) — 07 file tree with vim nav
- [task-B-multi-agent.md](task-B-multi-agent.md) — 08 parallel agent sessions (store refactor)
- [task-C-settings.md](task-C-settings.md) — 12-15 settings (hub + providers + model + raw)
- [task-D-landscape.md](task-D-landscape.md) — 09-11 landscape 3-pane
- [task-E-real-claude.md](task-E-real-claude.md) — replace mock with `@anthropic-ai/claude-agent-sdk`
