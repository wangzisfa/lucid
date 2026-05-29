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

## Auth (17–23) — portrait

All auth screens are command-driven. Provider keys (`g` `h` `a` `·`) live inside rose-colored brackets — the bracket itself is the affordance. **No vendor brand assets** (no white Google G, no GitHub mark) — the character IS the brand reference.

### `17-auth-login.png` — provider picker
**Purpose:** pick a sign-in method from the boot screen.
**Layout:** `LUCID · auth` header (rose dot, `unauthenticated` tag), the command line `$ lucid auth --provider <p>`, then four provider rows. Google gets a rose accent-bar + subtle gradient wash ("recommended"). Each row: `[k]` key · label · short hint (e.g. `+ repo scope`, `ios native`, `30 min`). Bottom: `› press g ▮` cursor prompt + tiny legal line.
**Behavior:** type the key (or tap the row) → open in-app browser tab for that provider. Guest skips the browser entirely.
**Source:** `D_Auth_Login` in `variation-d-auth.jsx`.

### `18-auth-bridge.png` — OAuth handoff (loading)
**Purpose:** waiting for the user to finish in the browser.
**Layout:** amber `WAITING` chip. Log stream fades in line-by-line (`✓ pkce verifier · sha256`, `✓ deep-link registered`, `◐ waiting for consent · t=12s`). A dashed amber card explains "finish sign-in in the browser" with an ASCII spinner (`◐` rotating) and `polling /token · 0.5s`. Below: `[↻] resend link` / `[x] cancel`. Bottom row: `// request_id · req_01HXG7K2…` for support.
**Behavior:** the app polls its own backend (which holds the OAuth state token) every 0.5s. On `200` → push success; on `4xx/timeout` → push error.
**Source:** `D_Auth_Bridge`.

### `19-auth-success.png` — identity confirmation
**Purpose:** brief beat after token exchange before jumping to repos.
**Layout:** mint `OK · 200` chip. Log lines all mint (`✓ token exchange · 142ms`, `✓ identity verified · iris@hey.com`). Mint-bordered card with an ASCII avatar (`IR` in a 44px square) + name + email + `via google · oauth pkce`. Bottom rose card: `› opening ~/repos ▮`.
**Behavior:** auto-advances to `02-repos` after ~600ms. Skippable by tapping.
**Source:** `D_Auth_Success`.

### `20-auth-error.png` — sign-in failed
**Purpose:** something went wrong during the handoff.
**Layout:** rose `ERR · 401` chip. The log stream shows the failure point (`✗ POST /token failed · 401 invalid_grant`). Rose-bordered fault card explains plain-English why, with a stack trace rendered as an ASCII tree (`├─ AuthBridge.exchange()` etc). Four recovery options: `[r] retry · same provider`, `[g] try google again from scratch`, `[b] back · choose another method`, `[?] copy diagnostics`.
**Source:** `D_Auth_Error`.

### `21-account.png` — profile & linked providers (lives in Settings)
**Purpose:** see who you're signed in as + manage linked providers.
**Layout:** `:Account` header. Identity card with a 48px rose-bordered ASCII avatar + name/email/pro-status. Below: `LINKED PROVIDERS · 2 of 4` divider, then 4 rows: google (PRIMARY · rose pill), github (LINKED · cyan pill), apple (LINK · greyed), email (LINK · greyed). Session-info dashed box: sid, opened, expires, devices. Bottom danger rows: `[x] sign out · this device`, `[X] sign out · all devices`, `[!] delete account · 14d cool-down`.
**Source:** `D_Settings_Account`.

### `22-signout.png` — sign-out confirm modal
**Purpose:** confirm a destructive action.
**Layout:** dimmed account view behind a rose-bordered modal. Modal header is a solid rose strip: `:CONFIRM · sign-out · esc to cancel`. Inside: serif heading `Sign out of lucid?`, mono body explaining "this device only · 2 active sessions remain", a faux shell preview of what's about to run (`$ lucid auth signout --device this`), then two buttons: `[esc] cancel` (outlined) and `[↵] sign out` (filled rose).
**Behavior:** `esc` or backdrop tap → dismiss. `↵` or tap on filled button → executes, jumps to `17-auth-login`.
**Source:** `D_Auth_Signout`.

### `23-reauth.png` — token expired takeover
**Purpose:** session lapsed mid-conversation; user needs to re-handshake without losing context.
**Layout:** dimmed session in background (visibly shows the in-flight plan). Amber-bordered banner at top. Amber header strip: `! REAUTH REQUIRED · 401 · token expired`. Serif heading `Your google session lapsed`. Explainer + faux shell showing the failed refresh. Two-column status grid: session PAUSED, drafts kept YES · 14m ago, token expired 2m ago. Two buttons: `[s] sign out` (outlined) and `[g] re-auth with google` (filled amber, takes 2/3 width).
**Behavior:** non-destructive — agent runs are paused, not cancelled. After successful reauth, the previous session resumes from the last tool call.
**Source:** `D_Auth_Reauth`.

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
| `WAIT` | amber  | OAuth bridge polling                                             |
| `OK`   | mint   | post-auth success beat                                           |
| `ERR`  | rose   | auth (or other) error state                                      |
| `3 LIVE` | mint | N parallel agents running                                        |

The chip should *pulse* gently (1s breathe) only in `GEN` / `REC` / `PLAN`. Static everywhere else.
