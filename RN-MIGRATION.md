# React Native migration

Lucid Terminal is being rebuilt from a Next.js web app (Capacitor WebView for
mobile) into a **bare React Native** app. This file is the running record of
the decisions and the staged plan.

## Decisions (locked)

| Question | Choice |
| --- | --- |
| Project form | **Bare React Native (RN CLI)** — not Expo |
| Where the RN app lives | **In-place at the repo root** (replaces the web app) |
| Agent backend | **Keep the existing Next.js server** as a remote backend in `./server` |

The RN client cannot run the Claude Agent SDK on-device, so the agent loop stays
server-side. The app talks to it over HTTP + SSE; the user sets the server URL in
**Settings → providers → server url**.

## Why native navigation (the original ask)

The web build faked Android's edge-swipe-back with manual `pointer` math, which
fights the browser's own gesture and is not native. In RN we use
`@react-navigation/native-stack`, which renders **real platform navigators** —
so the Android system back gesture (incl. Android 14 predictive back) and the
iOS interactive swipe-back are provided by the OS. **There is no gesture code in
the app.** See `src/navigation/RootStack.tsx` (`gestureEnabled`,
`fullScreenGestureEnabled`).

## Repo layout after the cutover

```
/                      bare RN app (root)
  index.js             AppRegistry entry (imports gesture-handler first)
  App.tsx              GestureHandlerRootView > SafeAreaProvider > NavigationContainer
  app.json             RN app name
  babel/metro/tsconfig RN build config (server/ is blocked from Metro)
  src/
    navigation/        native-stack + dark nav theme
    theme/tokens.ts    design tokens (the old CSS vars, as JS)
    components/        Screen (fullscreen canvas), PhoneBackground, TermAppBar, icons
    lib/               store, settings-store, files-store (AsyncStorage),
                       agent-client (react-native-sse), types, mock data
    screens/           Boot, Repos, Session, Agents, Files, Settings
  server/              standalone Next.js backend (agent loop)
    app/api/agent/*    /run (SSE) + /approve
    lib/               agent-approval-bus, agent-events, types
```

## Stage status

- [x] **Stage 1 — foundation + cutover**
  - Bare-RN config + entry; native-stack navigation (native back gesture).
  - Design tokens, fullscreen `Screen`/`PhoneBackground` (gradient + grid +
    ember, no fake chrome), `TermAppBar`, SVG icons.
  - Ported stores to AsyncStorage; `agent-client` over `react-native-sse`.
  - All six screens ported (lean but functional): Boot, Repos, Session
    (text-turn + plan-approve), Agents, Files, Settings (server url + key).
  - Backend relocated to `./server`; web + Capacitor scaffolding removed.
- [x] **Stage 2 — runnable MVP**
  - Native `android/` + `ios/` shells generated from the RN 0.76.5 template and
    committed (package `com.lucidterminal`, component `LucidTerminal`).
  - Dependencies pinned + locked (`package-lock.json`); installs clean.
  - **Verified**: `tsc --noEmit` passes and `react-native bundle` (Metro)
    produces a full JS bundle — every import resolves and the app would run.
  - `agentApiBase()` defaults to the local dev server (`10.0.2.2:3000` on the
    Android emulator, `localhost:3000` on iOS sim), so no setup is needed for
    the local happy path.
  - Committed sample repos under `server/demo-repos/{idea-garden,…}` so the
    agent has a real directory to work in out of the box.
- [ ] **Stage 3 — fidelity pass**: custom fonts (Geist Mono / Instrument Serif)
  via `npx react-native-asset`; scanlines; landscape two-pane layout; richer
  diff/plan/log views; settings sub-screens (model / providers / raw .lucidrc).
- [ ] **Stage 4 — voice capture**: replace the text input with hold-to-talk
  using a native speech module (e.g. `@react-native-voice/voice`); wire to the
  existing `finishVoiceTurn` store action.

## Running it locally

Native shells are committed, so no `init` step is needed.

```sh
# 1) install the app's JS deps
npm install
npm run pods        # iOS only (CocoaPods)

# 2) start the agent backend (separate terminal)
cd server
cp .env.local.example .env.local   # paste ANTHROPIC_API_KEY (or use BYOK in-app)
pnpm install && pnpm dev           # serves on :3000

# 3) run the app (repo root)
npm run start       # Metro
npm run android     # or: npm run ios
```

Out of the box the app talks to the local dev server (Android emulator →
`10.0.2.2:3000`, iOS sim → `localhost:3000`) and the `idea-garden` sample repo,
so a fresh `begin → pick repo → type a turn → APPROVE` flow works end-to-end as
long as the server has an Anthropic key. To run against a deployed server or a
real LAN device, set **Settings → providers → server url** (e.g.
`http://192.168.x.x:3000`).

> `android/` and `ios/` are committed; their build outputs (`*/build`,
> `.gradle`, `Pods`, `local.properties`) are gitignored. For a physical Android
> device, set `ANDROID_HOME` or add `android/local.properties` with `sdk.dir`.
> The old Capacitor `android/` project was removed.
