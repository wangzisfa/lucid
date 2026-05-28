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

- [x] **Stage 1 — foundation + cutover (this branch)**
  - Bare-RN config + entry; native-stack navigation (native back gesture).
  - Design tokens, fullscreen `Screen`/`PhoneBackground` (gradient + grid +
    ember, no fake chrome), `TermAppBar`, SVG icons.
  - Ported stores to AsyncStorage; `agent-client` over `react-native-sse`.
  - All six screens ported (lean but functional): Boot, Repos, Session
    (text-turn + plan-approve), Agents, Files, Settings (server url + key).
  - Backend relocated to `./server`; web + Capacitor scaffolding removed.
- [ ] **Stage 2 — native shells + run** (must be done on a dev machine; see below)
- [ ] **Stage 3 — fidelity pass**: custom fonts (Geist Mono / Instrument Serif)
  via `npx react-native-asset`; scanlines; landscape two-pane layout; richer
  diff/plan/log views; settings sub-screens (model / providers / raw .lucidrc).
- [ ] **Stage 4 — voice capture**: replace the text input with hold-to-talk
  using a native speech module (e.g. `@react-native-voice/voice`); wire to the
  existing `finishVoiceTurn` store action.

## Running it locally (Stage 2)

This sandbox can't build/run RN (no Android SDK / emulator / Metro), so the
native projects aren't committed. On a dev machine with the RN toolchain:

```sh
# 1) generate the native shells into this repo (keeps the JS/TS we wrote)
npx @react-native-community/cli init LucidTerminal --version 0.76.5 --directory _tmp_rn
# move _tmp_rn/android and _tmp_rn/ios into the repo root, then delete _tmp_rn
# (or run `init` in a scratch dir and copy android/ + ios/ over)

# 2) install + pods
npm install         # or pnpm install
npm run pods        # iOS only

# 3) start the agent backend
cd server && cp .env.local.example .env.local   # paste ANTHROPIC_API_KEY
pnpm install && pnpm dev                          # http://localhost:3000

# 4) run the app (in repo root)
npm run start       # Metro
npm run android     # or: npm run ios
```

In the app, open **Settings → providers** and set **server url** to your
machine's LAN address (e.g. `http://192.168.x.x:3000`) and optionally an
Anthropic key (BYOK). Then start a session from **repos**.

> Native folders (`android/`, `ios/`) are gitignored except for committed
> config; regenerate with the `init` step above. The old Capacitor `android/`
> project was removed.
