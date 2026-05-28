# Screens — per-screen breakdown

Every PNG in `screens/` is a frozen render of the design at 320×660 (portrait) or 660×320 (landscape) — the same dimensions every modern phone draws into. Match the **silhouette, typography, spacing, and color use** of each. Pixel-perfect not required.

> Cross-reference: every screen here corresponds to a `D_*` component in `source/variation-d*.jsx`. Read that file for exact strings, structure, and inline styles.

---

## Portrait (320×660)

### `01-boot.png` — Boot / handshake
**Purpose:** cold start. First thing the user sees.
**Layout:** centered Lucid mark + wordmark, single-line tagline (`// terminal · voice · agent`), then a vim-style "press [enter] to continue" prompt. Status bar at top.
**Behavior:** tap anywhere or press the hardware return → goes to `02-repos`. No splash animation; just appear.
**Source:** `D_Boot` in `variation-d.jsx`.

### `02-repos.png` — Repo list (`ls -la`)
**Purpose:** pick a repo to work on.
**Layout:** rendered as a shell `ls -la` listing. Each row: `drwxr-xr-x` permissions · timestamp · `repo-name/` (cyan) · short description (mid). Tap a row → opens `03-session` scoped to that repo.
**Empty state:** `$ git clone <url>` input prompt at the bottom.
**Source:** `D_Repos` in `variation-d.jsx`.

### `03-session.png` — The session (main screen)
**Purpose:** active coding conversation with the agent.
**Layout (top → bottom):**
1. `TermAppBar` — `~/idea-garden · ⌥ main · ● GEN`
2. User turn — prefixed `> ` mono. If from voice, shows `voice · 0:12` chip + a tiny static waveform sparkline.
3. Lucid turn header — `● lucid thought 4s · 3 files`
4. ASCII plan summary — `├─ ✓ create ReflectionCard.tsx` etc.
5. Diff block — `~/components/ReflectionCard.tsx · +22 −0` with green `+` lines.
6. Log stream — `$ pnpm typecheck` / `✓ tsc · 0 errors` / `→ localhost:5173 · HMR`.
7. Next-turn prompt — `> ready · ship it · add chime sound · another turn`
8. `TermBottomBar` (off-screen / scrollable).
**Source:** `D_Session` in `variation-d.jsx`.

### `04-plan.png` — Plan tree
**Purpose:** review/approve a multi-step plan before the agent executes.
**Layout:** large `PLAN` heading with step counter (`2/5`). ASCII tree of nodes: `[/]` done · `[●]` running · `[ ]` pending. Bottom CTA: `[A] APPROVE PLAN`. Below the tree: `j/k · a:approve · cmd-s save · gd diff` — vim-style hint row.
**Behavior:** tap `[A]` → all `[ ]` flip to `[●]` sequentially (stagger 250ms), state chip changes from `PLAN` to `GEN`.
**Source:** `D_Plan` in `variation-d.jsx`.

### `05-run.png` — Run / live preview
**Purpose:** see your changes running in real time.
**Layout:** half-and-half. Top half = the live preview rendered in a `WebView/iframe` (showing the actual app — here a "What stayed with you today?" reflection card). Bottom half = the run log + a small `localhost:5173 · HMR · 142ms` status. State chip: `LIVE`.
**Source:** `D_Run` in `variation-d.jsx`.

### `06-listening.png` — Hold to record
**Purpose:** capture voice input.
**Layout:** large rose `RECORDING` label + elapsed timer (`0:11.4`). Live transcript renders in serif italic (`"make the reflection card open with a soft chime, show tonight's moon phase quietly in the corner"`). Detected entities tagged below as cyan/rose pills (`reflection-card`, `chime: soft`, `moon.phase`). Big `<BlockWave>` in rose. Bottom: `HOLD · 0:11` button — visually pressed.
**Behavior:** release → "transcribing" state (whisper-v3 · 0.4s) → "done" → user turn appears in `03-session`. Drag finger up while holding → cancel.
**Source:** `D_Listening` in `variation-d.jsx`, behaviorally in `D_Live_Session` in `variation-d-live.jsx`.

### `07-files.png` — File tree (vim-style)
**Purpose:** browse the repo.
**Layout:** ASCII file tree with vim cursor (`>`) on the selected line. Folders highlighted cyan. Bottom hint row: `j/k navigate · l open · gg top · / search`.
**Source:** `D_Files` in `variation-d-extra.jsx`.

### `08-agents.png` — Parallel agents
**Purpose:** show + switch between multiple parallel agent sessions.
**Layout:** list of 3 running sessions, each with its own branch (cyan), state chip, last log line, and elapsed timer. `3 LIVE` chip in app bar.
**Source:** `D_Agents` in `variation-d-extra.jsx`.

---

## Landscape (660×320)

Triggered by device rotation. The phone unlocks a tmux-style multi-pane layout. Dividers between panes are **draggable** (`<PaneSplit>`).

### `09-land-session.png` — Session 3-pane
**Layout:** `PLAN │ CODE │ PREVIEW` with default widths 28% / 38% / 34%. App bar spans full width on top, bottom bar spans full width below. Each pane has its own scroll. Right-edge `HOLD` mic button is anchored at the bottom-right.
**Source:** `D_Land_Session` in `variation-d-extra.jsx`.

### `10-land-listening.png` — Listening hero
**Layout:** when REC is active in landscape, the transcript expands to span all three panes — voice is the hero. Block waveform fills the lower third edge-to-edge.
**Source:** `D_Land_Listening` in `variation-d-extra.jsx`.

### `11-land-run.png` — Multi-shell run
**Layout:** `SHELL │ PREVIEW │ DIFF`. Two shell tabs at the top of pane 1 (e.g., `dev`, `test`). Preview = WebView. Diff pane shows the currently-edited file's unified diff.
**Source:** `D_Land_Run` in `variation-d-extra.jsx`.

---

## Settings

### `12-settings-hub.png` — Settings hub
**Layout:** sectioned list. Each section is one row: `[key]` (mono, accent-colored) · short summary value · chevron. Sections: `[agent]`, `[providers]`, `[voice]`, `[ui]`, `[shortcuts]`, `[experiments]`, `[about]`. The first selected one is highlighted by inverting fg/bg.
**Source:** `D_Settings_Hub` in `variation-d-settings.jsx`.

### `13-settings-providers.png` — API keys (BYOK)
**Layout:** list of providers (Anthropic, OpenAI, local Ollama, etc). Each row: provider name · status pill (`linked` / `unset`) · masked key (`sk-ant-···k29x`) · model list · "added 2d ago". Add-key bottom CTA.
**Source:** `D_Settings_Providers` in `variation-d-settings.jsx`.

### `14-settings-model.png` — Agent / model drilldown
**Layout:** form-style key/value list. Model (`claude-sonnet-4.5`), context window (200K), thinking budget (`think-hard`), tools enabled, system prompt preview. Sliders use ASCII bars: `[████░░░░] 5/10`.
**Source:** `D_Settings_Model` in `variation-d-settings.jsx`.

### `15-settings-raw.png` — Raw `.lucidrc`
**Layout:** literal mono editor view of the user's `.lucidrc` TOML/JSONC file with syntax coloring (keys cyan, strings mid, comments lo). Header: `~/.lucidrc · readonly: false`. Bottom: `:w to save · :q to abandon`.
**Source:** `D_Settings` in `variation-d-extra.jsx`.

### `16-settings-land.png` — Settings landscape composite
**Layout:** 3-pane landscape: `[nav] │ [editor] │ [live .lucidrc]`. Edits in the middle pane preview live in the right pane.
**Source:** `D_Settings_Land` in `variation-d-settings.jsx`.

---

## State-chip glossary

The two-letter chip on the right of `TermAppBar` is the most important UI signal in the whole app. Read it constantly:

| Chip   | Color  | Meaning                                                          |
|--------|--------|------------------------------------------------------------------|
| `IDLE` | dim    | no session active                                                |
| `GEN`  | rose   | agent is generating / writing                                    |
| `PLAN` | amber  | agent is proposing a plan, awaiting approval                     |
| `REC`  | rose   | user is recording voice                                          |
| `LIVE` | mint   | run server is live, HMR connected                                |
| `EDIT` | cyan   | user is editing settings or files                                |
| `CONF` | cyan   | viewing config (`.lucidrc`)                                      |
| `3 LIVE` | mint | N parallel agents running                                        |

The chip should *pulse* gently (1s breathe) only in `GEN` / `REC` / `PLAN`. Static everywhere else.
