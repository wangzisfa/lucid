# design-asset/

Hand-off package for **Lucid Terminal** — the dev-aesthetic mobile coding-agent direction. Drop this folder into a fresh repo and point Claude Code at `PROMPT.md`.

---

## What this is

A complete visual + behavioral spec for one product direction (the "D" variation from the Lucid design exploration). Use it to implement the production app.

## What this is NOT

- Not production code. The `source/*.jsx` files are React mocks rendered inside a fake phone frame for design review. They use no router, no real state management, no platform APIs.
- Not a UI kit. Component primitives are sketched in the mocks; you re-build them properly in your real stack.
- Not exhaustive. Only the screens in `screens/*.png` are specified. Anything else (modals, error states, deeper settings) you design by analogy.

---

## How to feed this to Claude Code

The fastest one-shot is:

```bash
# from the repo root, after dropping in this folder
claude code "Read design-asset/PROMPT.md and the screens in \
  design-asset/screens/, then scaffold the project as specified. \
  Start with sprint 1 from section 5."
```

Or interactively:

1. Open Claude Code at the repo root.
2. `@design-asset/PROMPT.md` — attach the full brief.
3. `@design-asset/screens/` — attach all 16 screen renders.
4. `@design-asset/SCREENS.md` — attach the per-screen behavior notes.
5. (Optional) `@design-asset/source/variation-d.jsx` — only if Claude asks for a specific component's exact treatment. Don't dump all four source files unless asked; they're verbose.

---

## Folder map

```
design-asset/
├── README.md         this file
├── PROMPT.md         the main brief — read first
├── SCREENS.md        per-screen breakdown + state-chip glossary
├── tokens/
│   └── tokens.css    copy this into the production project as-is
├── source/           reference React mocks (visual spec only)
│   ├── lucid-shared.jsx
│   ├── variation-d.jsx
│   ├── variation-d-extra.jsx
│   ├── variation-d-live.jsx
│   ├── variation-d-auth.jsx
│   └── variation-d-settings.jsx
└── screens/          PNG render of every screen (visual ground truth)
    ├── 01-boot.png
    ├── 02-repos.png
    ├── 03-session.png
    ├── 04-plan.png
    ├── 05-run.png
    ├── 06-listening.png
    ├── 07-files.png
    ├── 08-agents.png
    ├── 09-land-session.png         (landscape)
    ├── 10-land-listening.png       (landscape)
    ├── 11-land-run.png             (landscape)
    ├── 12-settings-hub.png
    ├── 13-settings-providers.png
    ├── 14-settings-model.png
    ├── 15-settings-raw.png
    ├── 16-settings-land.png        (landscape)
    ├── 17-auth-login.png           ← auth flow
    ├── 18-auth-bridge.png
    ├── 19-auth-success.png
    ├── 20-auth-error.png
    ├── 21-account.png              (lives under settings)
    ├── 22-signout.png
    └── 23-reauth.png
```

---

## Tips for working with Claude Code on this

- **Build primitives first.** Section 4 of `PROMPT.md` lists the 10 components everything else composes from. Tell Claude Code to land those — `<TermPhone>`, `<TermAppBar>`, `<HoldMic>`, `<BlockWave>`, `<AsciiTree>`, etc. — before any screens. Each one is a 1–2 day task; the screens are then quick.
- **Wire the agent loop late.** Screens 1–8 are static enough to build against mocked data. Don't block on the Claude Agent SDK integration until the shell looks right.
- **Two passes per screen.** Pass 1: get the layout + colors right against the PNG. Pass 2: hook up real data and behavior. Don't try to do both at once or you'll get neither.
- **Keep the screens folder in the repo.** Reference them in PR descriptions ("now matches `06-listening.png`"). They are the spec.
