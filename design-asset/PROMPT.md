# Lucid · Implementation Brief for Claude Code

> **Build:** a native-feeling mobile coding agent called **Lucid Terminal** — voice-first, hacker-aesthetic, runs Claude as the underlying agent. Hand-off from a hi-fi design exploration; everything below is the source of truth.

---

## 0 · The pitch (read this first)

Lucid is a mobile app for coding on the go with an AI agent. The user opens a repo, holds a mic button, says *"add a reflection card at 9pm with a soft chime,"* and watches Lucid plan, write, test, and ship code — without ever opening a laptop.

This direction — **Lucid Terminal** — leans hard into a **terminal / hacker** aesthetic:
- monospace everywhere (Geist Mono)
- ASCII tree drawings for plans, file trees, diffs
- block-character waveforms (`█▓▒▒░`) instead of rounded SVG bars
- vim-style command bar at the bottom (`:w`, `:q`, `INSERT`)
- subtle CRT scanlines, faint dot/line grid backgrounds
- one neon aurora accent (rose/cyan/violet) used **sparingly** — most chrome is crisp white-on-near-black
- glow used as a *single ember* in a corner, not as a wash

It is **not** a chat app with a code panel. It is a **coding session** with conversation embedded.

---

## 1 · What you have in this folder

```
design-asset/
├── PROMPT.md          ← you are here
├── README.md          ← orientation + how to use this folder
├── SCREENS.md         ← per-screen breakdown (what each screen is, how it behaves)
├── tokens/
│   └── tokens.css     ← every color, font, radius, spacing, shadow as CSS variables
├── source/            ← reference React mocks (treat as visual spec, NOT production code)
│   ├── lucid-shared.jsx        ← icons, voice waveform, Lucid mark
│   ├── variation-d.jsx         ← portrait screens 1–6 (boot, repos, session, plan, run, listening)
│   ├── variation-d-extra.jsx   ← portrait 7–8 + all 3 landscape screens
│   ├── variation-d-live.jsx    ← interactive prototypes (hold-to-record, deploy, resizable panes)
│   └── variation-d-settings.jsx← settings hub + drilldowns
└── screens/           ← rendered PNG of every screen (visual ground truth — match these)
    ├── 01-boot.png ... 16-settings-land.png
```

**The `source/*.jsx` files are pinned, scaled-down React mocks built inside a 320×660 phone frame.** They are not lint-clean, not componentized, not exhaustive — they exist to *show you the exact visual treatment* of every element. Use them like a designer's Figma, not a starter kit. Re-implement everything in your real stack from scratch.

---

## 2 · Recommended stack

If the user hasn't specified one, default to:

- **React Native + Expo (TypeScript)** — best fit for the gesture-heavy, voice-first, portrait-and-landscape design. SDK 51+.
- **Reanimated 3** for the live waveform, mic-hold pressure, pane-divider drag, deploy step animation.
- **Expo Router (file-based routes)** for navigation.
- **NativeWind** *or* plain `StyleSheet` — pick one and stick with it. The design uses very few colors but many states, so token-mapped styles win.
- **expo-av** + **expo-speech-recognition** (or whisper.cpp via expo-modules) for the hold-to-record mic.
- **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) for the actual coding agent loop. Spawn a session per repo; pipe its tool calls + diffs into the session view.

Cross-platform fallbacks:
- iOS-first; ship Android in the same codebase. The design works on both — status bar treatment in `source/lucid-shared.jsx` is generic.
- If the user asks for web, use **Next.js + Tailwind** and reuse the `tokens.css` directly. The portrait screens still work in a centered phone-shaped column at desktop sizes.

---

## 3 · Design tokens (must obey)

Copy `tokens/tokens.css` into your project and reference it by name. **Do not invent new colors.** All values:

### Type
- **Display** — `Instrument Serif` (italic, light) — used for the brand wordmark, the voice-transcription quote, and the in-canvas "What stayed with you today?" placeholder. Almost nowhere else.
- **Sans** — `Geist` — UI labels, button text, headings.
- **Mono** — `Geist Mono` — **everything else.** Bodies, lists, prompts, file paths, code, diffs, log lines, the vim bar. This is a terminal app.

### Palette (dark-only, no light mode for D)
- `--bg-deep: #07060f`     — outer canvas
- `--bg-cosmos: #0c0a1c`   — slight elevation
- Phone interior: `#08070f → #050409` linear gradient + faint 16px grid (3% white)
- Text: `--text-hi: #f6f4ff` / `--text-mid: rgba(246,244,255,0.66)` / `--text-lo: 0.40` / `--text-disabled: 0.22`

### Accents (use ONE per screen, max two)
- `--rose: #FF8AB4`   — REC state, voice, ship/deploy ember, primary CTA glow
- `--cyan: #6BE5FF`   — branch / git refs / file paths
- `--mint: #5EFFB2`   — success / passing tests / +N additions
- `--amber: #FFC56B`  — warnings, "thinking" states
- `--violet: #8B6FFF` — secondary brand accent (used sparingly)

### Shape
- Phone frame radius: 38px (portrait), 28px (landscape)
- Card radius: 14px (`--r-md`) is the default; pills use `--r-pill: 9999px`
- Borders: `rgba(255,255,255,0.09)` faint, `rgba(255,255,255,0.18)` bright

### Texture
- **Grid background** — 16×16px lines at `rgba(255,255,255,0.03)`, masked by a radial fade so center is dense and edges fade out
- **Scanlines** — `repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0, transparent 1px, transparent 2px, rgba(255,255,255,0.018) 3px)` at `mixBlendMode: 'overlay'`, opacity 0.7. Apply once per screen at the phone-frame level.
- **Aurora ember** — a single 280×280 blurred radial of `rgba(255,107,157,0.22)` positioned off-screen top-right. One per screen, never multiple.

---

## 4 · Component vocabulary

Build these primitives first (everything else composes from them):

| Primitive | Role | Source reference |
|---|---|---|
| `<TermPhone>` | screen container (gradient + grid + scanlines + corner ember) | `variation-d.jsx` line 7 |
| `<TermAppBar>` | top bar: `~/project · branch · STATE` (e.g. `GEN`, `REC`, `PLAN`, `LIVE`) | `variation-d.jsx` |
| `<TermBottomBar>` | vim-style command bar: `INSERT` chip + input + `:w/:q` hints | `variation-d.jsx` |
| `<HoldMic>` | the big PTT button — `HOLD` idle, `RECORDING 0:11.4` active, releases to "transcribing" then "done" | `variation-d-live.jsx` `useHoldRecord` |
| `<BlockWave>` | `█▓▒░`-style waveform driven by rAF, not CSS keyframes | `variation-d-live.jsx` `LiveWave` |
| `<AsciiTree>` | renders plans / file trees with `├─`, `└─`, `│`, `[/]`, `[ ]` glyphs | `variation-d.jsx` D_Plan, `variation-d-extra.jsx` D_Files |
| `<DiffBlock>` | unified diff: `+ green / - rose / ~ context` mono lines, with `+22 / −0` header | `variation-d.jsx` D_Session |
| `<LogStream>` | shell-style log: `$ pnpm dev`, `→ localhost:5173 · HMR`, `✓ tsc · 0 errors` | every screen |
| `<StateChip>` | the colored two-char status badge in the app bar (`■ GEN`, `■ REC`, `■ LIVE`) — color comes from `--rose / --mint / --amber / --cyan` | `variation-d.jsx` `TermAppBar` |
| `<PaneSplit>` | resizable 2- or 3-column container for landscape | `variation-d-live.jsx` `D_Live_Land` |

Don't use rounded "card" components. Don't use shadow boxes. Spacing is enforced by **monospace alignment and ASCII rules (`──────`)**, not padding + corners.

---

## 5 · Screens to build (in order)

See `SCREENS.md` for the full table with screenshots. TL;DR build order:

**Sprint 1 — read-only shell**
1. `01-boot` — cold start / handshake
2. `02-repos` — repo list rendered as `ls -la`
3. `03-session` — the main coding screen (read-only, no real agent yet)

**Sprint 2 — the loop**
4. `06-listening` — hold-to-record voice input
5. `04-plan` — ASCII plan tree with `[A] APPROVE PLAN`
6. `05-run` — run + live preview split

**Sprint 3 — depth**
7. `07-files` — vim-style file tree
8. `08-agents` — parallel agent sessions
9. `12-15 settings` — sectioned settings + raw `.lucidrc` view
10. `09-11 landscape` — rotate-to-unlock tmux-style multi-pane

---

## 6 · Behaviors that matter

Things the static screens don't show — implement these:

- **Hold-to-record mic.** Press-and-hold a 56px CTA. While held: pulse rose ember behind it, run `<BlockWave>` at full amplitude, stream transcription tokens left-to-right at ~1.5 tokens/sec. Release → "transcribing" (whisper-style) ~600ms → "done" → push as new user turn. Drag finger up while held → cancel.
- **State chip drives chrome.** When `state === 'REC'`, the entire phone tints faintly rose (10% rose wash, mix-blend overlay). When `LIVE`, mint. When `GEN`, no tint. When `PLAN`, amber pulse on the app-bar chip only.
- **Plan approval.** Plan items render as `[/]` (done), `[●]` (running), `[ ]` (pending). User taps `[A] APPROVE PLAN` → all `[ ]` flip to `[●]` sequentially with 250ms stagger.
- **Live preview.** The "preview" pane is a real `WebView` (RN) or `iframe` (web) pointed at the agent's dev server. Show `live · 142ms` HMR badge in the corner.
- **Landscape unlock.** Rotating the device transitions from the single-pane portrait view to a 3-pane landscape: `PLAN │ CODE │ PREVIEW`. The dividers are draggable. Default widths: 28% / 38% / 34%.
- **Deploy sequence.** A discrete state machine: `pre-run → build → typecheck → push → deploying → live`. Each step animates in as a log line; the rose corner ember intensifies as it progresses. See `D_Deploy` in `variation-d-live.jsx`.
- **Scanlines + grid never animate.** They are static texture, not a vibe loop. Resist the urge.
- **No splash screen, no logo intro.** The first thing the user sees on cold start is `01-boot` — a one-screen handshake (project picker / sign in with Claude).

---

## 7 · What NOT to do

- **No emoji.** Anywhere. Use the icon set in `lucid-shared.jsx` (mono SVG, 1.6px stroke) and ASCII glyphs.
- **No rainbow gradients.** The aurora gradient (`--aurora`) exists, but you should use it on **at most one element per app** — usually the Lucid mark in onboarding/settings. The rest of D is crisp single-color.
- **No drop-shadow soft cards.** Edges are 1px borders at low opacity. Depth comes from background gradients and the corner ember, not box-shadow.
- **No rounded-pill buttons everywhere.** Buttons are rectangles with 6px radius (`--r-xs`). Pills are reserved for status chips and tags.
- **No skeuomorphic glass.** No `backdrop-filter` blur except on the bottom command bar in landscape.
- **No theme switcher.** D is dark-mode-only. Light mode kills the aesthetic.
- **No "AI sparkle" iconography.** No four-pointed stars on send buttons. The mic is the primary input affordance.

---

## 8 · Acceptance criteria

You ship when:

1. All 16 screens in `screens/*.png` are recognizable side-by-side with your implementation. Pixel-perfect not required; **silhouette + typography + spacing + color use must match.**
2. Hold-to-record voice works end-to-end (mic → transcript → agent turn).
3. Plan → approve → run loop works against a real Claude Agent SDK session in at least one demo repo.
4. Portrait↔landscape rotation transitions between single-pane and 3-pane layouts without losing session state.
5. The app feels like a *terminal*, not a chatbot. Show it to a senior engineer and they should say "oh, neat" before they say "wait, this is on a phone?".

---

## 9 · Stretch (only after #8)

- **Voice replay** — tap any user turn's `voice · 0:12` chip to scrub the audio.
- **Branch picker** — long-press the branch name in `TermAppBar` to switch.
- **Multi-agent.** `08-agents` shows three parallel sessions; build the dispatcher behind it.
- **`.lucidrc` live editing.** `15-settings-raw` is a code editor on the user's config. Lint as they type.

---

## 10 · Hand-off questions to surface back

If anything below is unclear from this packet, ask the user before building:

- Target platform priority — iOS only, both, or web first?
- Real Claude integration or a mocked agent for the first pass?
- Repo source — clone over SSH? GitHub OAuth? Local-only via file picker?
- Voice provider — on-device (Apple Speech / Android SpeechRecognizer), Whisper, or Anthropic's voice endpoint when it ships?
- Deploy target shown in `D_Deploy` — Vercel / Fly / Railway / custom? Pick one and wire it.
