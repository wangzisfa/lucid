# Task C — Settings screens (12-15)

## Context

You're building the four settings screens for **Lucid Terminal**, a voice-first mobile coding agent. Stack: Next.js 14 + TS + Tailwind + Zustand. Repo: `/Users/bytedance/Desktop/Dev/lucid`. Read `design-asset/PROMPT.md` + `design-asset/SCREENS.md` first, and look at:

- `design-asset/screens/12-settings-hub.png`
- `design-asset/screens/13-settings-providers.png`
- `design-asset/screens/14-settings-model.png`
- `design-asset/screens/15-settings-raw.png`

Reference JSX in `design-asset/source/variation-d-settings.jsx` and `variation-d-extra.jsx` (`D_Settings` raw view). Use them for exact strings + spacing; re-implement in TS.

This is a **web-first build of a mobile app**. Follow the mobile-architecture rules in `tasks/README.md`.

**Independent task** — no conflict with A/B/D/E.

## Goal

Four screens + a persisted `useSettings` store + three reusable form primitives (`<Toggle>`, `<Stepper>`, `<TermBar>`).

| Screen | Route | Notes |
|---|---|---|
| 12 hub | `/settings` | sectioned list, j/k nav, enter to drill |
| 13 providers | `/settings/providers` | BYOK; add-key flow with paste/test/save |
| 14 model | `/settings/model` | model radio, context slider, thinking stepper, temp slider, system prompt preview |
| 15 raw | `/settings/raw` | live `.lucidrc` editor (real textarea + syntax color overlay) |

## Settings store

New `lib/settings-store.ts` with Zustand `persist` middleware, storing to `lucid:settings:v1` in `localStorage`:

```ts
export interface SettingsShape {
  agent: {
    model: 'claude-haiku-4' | 'claude-sonnet-4.5' | 'claude-opus-4.1' | 'gpt-5' | 'gemini-2.5' | 'qwen-32b';
    contextWindow: 50_000 | 200_000 | 1_000_000;
    thinking: 'off' | 'think' | 'think-hard' | 'think-harder';
    temperature: number;                 // 0..1
    verifyBeforeShip: boolean;
    autoApprove: boolean;
    allowShellExec: boolean;
    systemPrompt: string;
  };
  providers: {
    active: 'anthropic' | 'openai' | 'google' | 'openrouter' | 'ollama' | 'lucid-cloud';
    anthropicKey: string;                // never logged
    openaiKey: string;
    googleKey: string;
    ollamaUrl: string;
    fallback: 'lucid-cloud' | 'none';
    onDeviceOnly: boolean;
  };
  voice: {
    stt: 'whisper-v3' | 'apple' | 'android';
    hotkey: 'hold-mic' | 'tap-twice';
    vad: number;                         // 0..1
  };
  ui: {
    theme: 'lucid-terminal';
    density: 'compact' | 'roomy';
    scanlines: boolean;
    auroraAccent: string;                // hex
  };
}

export const defaults: SettingsShape = { ... };
```

The raw `.lucidrc` view (screen 15) is just **a serializer over this same store** — every keystroke parses + writes back when valid. Implement `settingsToToml(s)` and `tomlToSettings(s)` (you can use a tiny hand-written parser — only need flat `key = value` per section).

## Form primitives

New components, all in `components/form/`:

- `Toggle.tsx` — `<Toggle on={boolean} color="mint|rose" onChange={(v)=>void} />` rendering the two-chip `ON OFF` from `D_Settings_Land`.
- `Stepper.tsx` — `<Stepper value={string} options={string[]} color="cyan|violet" onChange={(v)=>void} />` matching the `< value >` look.
- `TermBar.tsx` — `<TermBar value={number} max={number} color="cyan|mint|rose" />` ASCII `[████░░░░]` slider visual. Bonus: clickable (tap any cell to jump).

Wire keyboard support too:
- `j` / `k` on the hub moves the section cursor; `Enter` opens; `/` filters
- `<` `>` on Stepper rotates; `Space` on Toggle flips

## Screen-by-screen

### 12 hub

- Sectioned list: `[agent]` `[providers]` `[voice]` `[approvals]` `[memory]` `[tools]` `[integrations]` `[theme]` `[workspace]` `[account]` `[danger]`.
- Each row: `[key]` mono accent · summary value · `→` chevron.
- Cursor selection: rose `>` + left-border + soft background.
- Footer tips block: `:e` `:reload` `:reset` hints.

### 13 providers

- Six provider cards (anthropic, openai, google, openrouter, ollama, lucid-cloud) with status pill (`● LINKED` / `● LOCAL` / `● PRO` / `○ EMPTY`).
- Per-model routing list at bottom.
- Safety toggles section using `<Toggle>`.
- Add-key panel: provider stepper + masked input + `[⌘V] PASTE` `[T] TEST` `[↵] SAVE` action chips. Pasting (`⌘V` / `Ctrl+V`) reads clipboard via `navigator.clipboard.readText()` and fills the field.

### 14 model

- Model radio list with linked-status + `KEY ✓` / `NEEDS KEY` badges (read keys from settings store).
- Context window: 3-stop slider — `50K`, `200K`, `1M` — using `<TermBar>`. Drag or arrow-keys to change.
- Thinking budget: `<Stepper>` cycling `off → think → think-hard → think-harder`.
- Temperature slider via `<TermBar>` driven by drag.
- System prompt: `<textarea>` with monospaced placeholder. Persist on blur.
- Token estimate row at bottom — just compute `Math.round(systemPrompt.length / 4) + 6000` as a fake estimate, render dollar at `$0.000003 / tok`.

### 15 raw

- Header `~/.lucidrc · readonly: false`.
- Real `<textarea>` that holds the TOML string, with a syntax-highlighted overlay rendered behind it (transparent textarea on top, colored `<pre>` underneath). Reuse the `<Syntax>`-style approach but with a TOML-specific tokenizer: section headers rose, keys white, strings cyan, numbers mint, comments lo.
- Save with `:w` on submit (Enter in normal mode) → parse + write to settings store. Invalid TOML → red status line; valid → mint `● saved 142ms ago`.
- Bottom: `:w to save · :q to abandon` hint.

## Files you'll create / edit

| Path | Op |
|---|---|
| `lib/settings-store.ts` | new |
| `lib/lucidrc.ts` | new (serializer + parser) |
| `components/form/Toggle.tsx` | new |
| `components/form/Stepper.tsx` | new |
| `components/form/TermBar.tsx` | new |
| `components/screens/SettingsHub.tsx` | new |
| `components/screens/SettingsProviders.tsx` | new |
| `components/screens/SettingsModel.tsx` | new |
| `components/screens/SettingsRaw.tsx` | new |
| `app/settings/page.tsx` | new |
| `app/settings/providers/page.tsx` | new |
| `app/settings/model/page.tsx` | new |
| `app/settings/raw/page.tsx` | new |

## Acceptance / ready check

`pnpm typecheck` clean, `pnpm dev` boots, then:

1. `/settings` matches `12-settings-hub.png` silhouette; arrow keys + Enter navigate.
2. `/settings/providers`: paste a fake `sk-` key, hit save → it shows masked. Refresh page → key is still there (persisted).
3. `/settings/model`: drag temperature → state updates → go to `/settings/raw` → the TOML reflects it.
4. `/settings/raw`: type into the textarea, mistype a key, see the parser flag it; fix it, `:w` saves.
5. Hit `/settings/raw` and `/settings/model` side-by-side (split window) — every change in 14 reflects in 15's textarea.
6. Reload mid-edit — store persists; unsaved buffer in raw view does not (that's session-only).

## Out of scope

- Real provider API calls (key test is a no-op that resolves in 600ms).
- Theme switching (we're dark-only forever).
- Multi-profile / workspace settings (single global store).

## Hand-off note

When done, append to `tasks/STATUS.md`:

```
- [x] task-C — settings landed @ <git sha>
```
