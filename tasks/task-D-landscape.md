# Task D — Landscape 3-pane (09-11)

## Context

You're building landscape rotation for **Lucid Terminal**, a voice-first mobile coding agent. Stack: Next.js 14 + TS + Tailwind + Zustand. Repo: `/Users/bytedance/Desktop/Dev/lucid`. Read `design-asset/PROMPT.md` + `design-asset/SCREENS.md` first, and look at:

- `design-asset/screens/09-land-session.png` — PLAN │ CODE │ PREVIEW
- `design-asset/screens/10-land-listening.png` — listening hero across all panes
- `design-asset/screens/11-land-run.png` — SHELL │ PREVIEW │ DIFF

Reference JSX in `design-asset/source/variation-d-extra.jsx` (D_Land_*) and `variation-d-live.jsx` (D_Live_Land — has the working draggable pane).

This is a **web-first build of a mobile app**. Follow the mobile-architecture rules in `tasks/README.md`.

**Depends on:** Task 0's `useOrientation()` hook. If Task 0 isn't merged yet, write a stub inline and remove it on merge.

## Goal

When the device rotates to landscape (or the browser window aspect ratio crosses ≥ 1.3), `/session` swaps from the single-pane portrait layout to a 3-pane tmux-style layout. State persists across the rotation (session store is the source of truth — both views read from it).

## Spec

### Landscape phone frame

Use `<LandTermPhone>` matching the JSX `LandTermPhone` in `variation-d-extra.jsx`:
- 660×320 rounded rect, 28px corners
- Dynamic-island stub on left (rotated)
- Same grid + scanline + corner-ember treatment
- Content area inset to avoid the island (left ≥ 60px)

### `<PaneSplit>` primitive

`components/landscape/PaneSplit.tsx`. Takes 2-N children + initial widths array (percent). Renders draggable dividers between panes. Drag math from `D_Live_Land` `startDrag` in `variation-d-live.jsx` — copy the algorithm, type it properly. Min pane width 15%. Dividers are 6px wide with rose accent center bar.

Pointer events only (`onPointerDown`). `touch-action: none` on dividers. Honor `Esc` to reset to default widths.

### 09 LandSessionScreen — PLAN │ CODE │ PREVIEW

Triggered by `useOrientation() === 'landscape'` inside `SessionScreen`. Replace the portrait render with `LandSessionScreen`.

Three panes:
1. **PLAN**: condensed ASCII tree of the latest agent turn's plan + inline `[A] APPROVE PLAN` mint chip when awaiting approval (reuse the same approve action from the store).
2. **CODE**: the latest diff rendered with line numbers + `<Syntax>` highlighter on the agent-generated file. If no diff yet, show "no changes yet" placeholder.
3. **PREVIEW**: same iframe to `/preview/reflection-card` used by portrait's `PreviewSheet`.

Default widths: `28 / 38 / 34`. App bar across the top (full-width, see JSX). Bottom command bar full-width with `INSERT`/`VOICE` chip + cmd + mic button anchored right.

### 10 LandListeningScreen — listening hero

When state === `REC`, override the 3-pane layout with a single hero layout:
- Mini header with REC dot + elapsed timer
- Hero italic transcript filling the upper 60% of the screen, max-width 460px
- Token pills row below
- Bottom strip: full-width BlockWave + the HOLD pill on the right

This view reads `recElapsed` + `interim` from the active session.

### 11 LandRunScreen — SHELL │ PREVIEW │ DIFF

Toggle into this layout when the latest agent turn's `ranToCompletion === true` AND the user taps a "SHELL" chip in the app bar. (Or just always show 11 when no plan is pending. Choose what's more honest to the user.)

Three panes:
1. **SHELL**: cumulative log from all turns + a `$ _` blinking cursor at the bottom
2. **PREVIEW**: same iframe + a `iPhone 15 · 9:00pm` viewport indicator
3. **DIFF**: file-touched list with `+N −M` deltas, agent notes block, `[S] SHIP TO MAIN` mint chip at bottom

### Behavior bullet points

- Rotation transition: no animation needed; just swap. Session state survives.
- Dividers draggable with pointer; touch-action handled.
- All 3 landscape variants share the same `<LandTermPhone>` wrapper.
- Bottom command bar adapts: in 09 it's INSERT, in 10 it's VOICE (rose), in 11 it's NORMAL.
- The right-side HOLD button is a `<HoldMic>` wired to the active session's `useVoice()`.

## Files you'll create / edit

| Path | Op |
|---|---|
| `components/landscape/LandTermPhone.tsx` | new |
| `components/landscape/PaneSplit.tsx` | new |
| `components/landscape/Pane.tsx` | new (title + body + footer wrapper) |
| `components/landscape/LandSessionScreen.tsx` | new |
| `components/landscape/LandListeningScreen.tsx` | new |
| `components/landscape/LandRunScreen.tsx` | new |
| `components/screens/SessionScreen.tsx` | edit (orientation switch) |
| `lib/orientation.ts` | edit if needed (assumes Task 0 shipped) |

## Acceptance / ready check

`pnpm typecheck` clean, `pnpm dev` boots, then:

1. Open `/session` in a desktop browser. Resize window: width > height by >1.3× → layout swaps to 3-pane. Resize back → portrait returns.
2. Submit a turn (use `/debug/run` if you don't want to hold a mic) → all three panes update live.
3. Drag the divider between PLAN and CODE: both panes resize; CODE+PREVIEW don't overlap; widths persist across re-renders in the same load.
4. Tap `[A] APPROVE PLAN` in PLAN pane → plan runs, diff fills in CODE, preview loads.
5. While landscape, press and hold the right-side mic → layout cross-fades into 10's hero transcript.
6. Refresh mid-landscape: still landscape, state preserved.
7. iPad Safari (or a mobile simulator) actually rotates — confirm `useOrientation()` reacts to `orientationchange`, not just window resize.

## Out of scope

- Saving pane widths to localStorage. Just session-local.
- Tablet-specific tweaks (we're targeting phones).
- Settings landscape composite (16) — already covered by Task C if they ship a landscape variant; otherwise punt.

## Hand-off note

When done, append to `tasks/STATUS.md`:

```
- [x] task-D — landscape landed @ <git sha>
```
