# Task 0 — Mobile-app foundation

> Run this first. Every other task assumes these primitives exist.

## Context

You're working on **Lucid Terminal**, a voice-first mobile coding agent. Stack: Next.js 14 + TS + Tailwind + Zustand. Current code at `/Users/bytedance/Desktop/Dev/lucid`. Design spec at `design-asset/PROMPT.md` + `design-asset/SCREENS.md` — read both before starting.

This is a **web-first build of an app that will eventually run as React Native + Expo**. Your job is to make the *shape* of the code native-mobile-shaped — so a future RN port is translation, not rewrite.

## Goal

Add the foundation pieces that make the current Web app feel native and that other sub-tasks depend on:

1. **Viewport lock + safe area** — viewport-fit cover, `env(safe-area-inset-*)` paddings on `<TermPhone>` and bottom bars.
2. **Session persistence** — Zustand `persist` middleware writing `useSession` state to `localStorage` under key `lucid:session:v1`. Migrate-safe (versioned). Refresh `/session` mid-conversation → all turns restored.
3. **Orientation hook** — `lib/orientation.ts` exporting `useOrientation()` → `'portrait' | 'landscape'` based on `matchMedia('(orientation: landscape)')`. SSR-safe (default 'portrait' on server).
4. **Keyboard-aware bottom bar** — `lib/useViewportBottom.ts` returning the px offset to lift the bottom bar above the soft keyboard, using `window.visualViewport`. Wire it into `components/session/InputBar.tsx`.
5. **PWA shell** — `public/manifest.webmanifest`, `<link rel="manifest">` in `app/layout.tsx`, `theme-color`, `apple-mobile-web-app-capable`, `viewport-fit=cover`. Basic SVG icon (single rose square, 512×512). Standalone `display`. Skip service worker — not needed yet.
6. **Touch hardening** — audit existing `onPointer*` handlers in `components/HoldMic.tsx`, `components/session/InputBar.tsx`, `components/screens/BootScreen.tsx`, `components/screens/ReposScreen.tsx`. Ensure `touch-action: none` on the mic button and that `pointercancel` triggers the same cleanup as `pointerup`/`pointerleave`. Confirm the screen doesn't scroll while you hold the mic on mobile Safari.

## Files you'll create/edit

| Path | Op | Note |
|---|---|---|
| `app/layout.tsx` | edit | viewport meta + manifest link + theme color |
| `app/globals.css` | edit | add safe-area-inset utility classes |
| `lib/store.ts` | edit | wrap `create` with `persist`; add migration version |
| `lib/orientation.ts` | new | `useOrientation()` |
| `lib/useViewportBottom.ts` | new | visualViewport offset hook |
| `components/TermPhone.tsx` | edit | apply safe-area padding when fullbleed |
| `components/session/InputBar.tsx` | edit | wire viewport offset |
| `components/HoldMic.tsx` | edit | add `pointercancel`, `touch-action: none` |
| `public/manifest.webmanifest` | new | name, short_name, start_url=/ , display=standalone |
| `public/icon-512.svg` | new | rose-on-near-black square mark |

## Out of scope

- Service worker / offline caching — punt to later.
- Native gesture libraries — `onPointer*` stays.
- Landscape rendering itself — that's Task D. You only ship the *hook*.

## Acceptance / ready check

Run `pnpm typecheck` (must pass) and `pnpm dev`. Then verify in browser:

1. Open `/`, click into `/repos`, pick a repo, hit `/session`. Hold the mic, speak (or just hold ≥1s), release. Plan appears.
2. **Refresh the page mid-plan.** Plan + turns are still there. Awaiting approval still awaiting.
3. iOS Simulator or Safari with viewport ≤ 414px: `<TermPhone>` is full-bleed; status bar area respects the notch. Bottom command bar stays above the home indicator.
4. Tap the input field to bring up the keyboard. The input bar rides above the keyboard.
5. Open `/debug/run` (existing dev page) — it now shows `useOrientation` value updating when you rotate the device.
6. `npx lighthouse http://localhost:3000 --view --only-categories=pwa` reports installable.

## Reference

- `design-asset/PROMPT.md` §3 (tokens), §6 (behaviors), §8 (acceptance criteria)
- Existing primitives: `components/TermPhone.tsx`, `components/session/InputBar.tsx`, `lib/store.ts`

## Hand-off note

When you finish, leave a one-line summary in `tasks/STATUS.md` like:

```
- [x] task-0 — foundation landed @ <git sha>
```

so the other sessions know they can start.
