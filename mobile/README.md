# Android packaging (Capacitor)

Lucid Terminal's agent loop runs **server-side** (`/api/agent/run` SSE +
`@anthropic-ai/claude-agent-sdk` on Node), so the Android app cannot run it
on-device. The APK is a native WebView shell; the agent always executes on a
server you deploy.

## Prerequisites (on your build machine)

- JDK 21 (`java -version` must report 21 — Capacitor 8 requires it)
- Android SDK with **platform 36** + build-tools, and `ANDROID_HOME` set
  (Android Studio installs these; or use `sdkmanager`)
- Network access to `dl.google.com` / `maven.google.com` (the Android Gradle
  Plugin and AndroidX/Capacitor deps resolve from Google's Maven repo)

> The cloud session that scaffolded this could not build the binary itself:
> Google's hosts are blocked there and the Android SDK can't be installed.
> Everything except the final Gradle build is committed.

## Two packaging modes

### 1. Demo bundle — configure inside the app (recommended)

Bundles the static client UI into the APK. The app opens into the real UI
offline; you set the server URL + API key in **Settings › providers**, and
agent turns hit that remote server.

```sh
pnpm install
pnpm android:demo     # static export (app/api stashed) → cap sync → assembleDebug
```

Then on the phone: open **Settings › providers**, fill **server url**
(`https://your-lucid-server`) and paste your **anthropic** key (`sk-ant-…`).
Browsing the UI works with no server; running the agent needs both set.

### 2. Remote-URL shell — bake the URL at build time

The WebView loads your deployed instance directly; no in-app config.

```sh
pnpm install
export LUCID_MOBILE_SERVER_URL=https://your-lucid-deployment.example.com
pnpm android:apk
```

Output (both modes): `android/app/build/outputs/apk/debug/app-debug.apk`

## BYOK (bring-your-own-key)

The client sends the key from **Settings › providers** in each
`/api/agent/run` request body; the server hands it to the agent subprocess via
`options.env.ANTHROPIC_API_KEY`, falling back to the server's own
`ANTHROPIC_API_KEY` env var when the request omits one. The key is **never**
compiled into the APK.

- Must be an **Anthropic** key (`sk-ant-…`). The agent SDK speaks Anthropic's
  native API — an OpenRouter / OpenAI key will not work here.
- Send keys only over **HTTPS** (the body crosses the network each turn).

## CORS

The Android WebView calls the agent routes cross-origin
(`capacitor://localhost` → your server), so `app/api/agent/{run,approve}`
return `Access-Control-Allow-Origin: *` and handle the `OPTIONS` preflight.
Tighten the origin allowlist before any public deployment.

## Server deployment

The server needs a Node runtime (not static hosting): Vercel, a VPS, a
container, etc. Set `ANTHROPIC_API_KEY` there if you want a server-side
fallback key. The agent runs against repos on **that server's** filesystem
under `PROJECT_ROOT`.

## Other commands

```sh
pnpm mobile:export        # build only the static client bundle into out/
pnpm cap:sync             # copy web assets + config into the native project
pnpm android:open         # open the project in Android Studio
```

## Release build

Configure signing in `android/app/build.gradle` (a keystore + `signingConfigs`),
then `cd android && ./gradlew assembleRelease` (or `bundleRelease` for an AAB).
