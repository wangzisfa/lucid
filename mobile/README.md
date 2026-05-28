# Android packaging (Capacitor)

Lucid Terminal's agent loop runs **server-side** (`/api/agent/run` SSE +
`@anthropic-ai/claude-agent-sdk` on Node), so the Android app cannot run it
on-device. The APK is a native WebView shell around a **deployed** Next.js
instance — point it at your server and all the relative `/api/...` calls work
against that origin.

## Prerequisites (on your build machine)

- JDK 21
- Android SDK with **platform 36** + build-tools, and `ANDROID_HOME` set
  (Android Studio installs these; or use `sdkmanager`)
- Network access to `dl.google.com` / `maven.google.com` (the Android Gradle
  Plugin and AndroidX/Capacitor deps resolve from Google's Maven repo)

> The cloud session that scaffolded this could not build the binary itself:
> Google's hosts are blocked there and the Android SDK can't be installed.
> Everything except the final Gradle build is committed.

## Build a debug APK

```sh
pnpm install

# Point the app at your deployed Lucid Terminal server:
export LUCID_MOBILE_SERVER_URL=https://your-lucid-deployment.example.com

pnpm android:apk          # cap sync android && ./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

For a LAN dev server use an `http://<your-ip>:3000` URL — `capacitor.config.ts`
auto-enables cleartext for `http://` origins.

## Other useful commands

```sh
pnpm cap:sync             # copy web assets + config into the native project
pnpm android:open         # open the project in Android Studio
```

## How the server URL is wired

`capacitor.config.ts` reads `LUCID_MOBILE_SERVER_URL` at sync time. When set,
the WebView loads that URL directly; when unset it falls back to the bundled
`mobile/www/index.html` placeholder (which just tells you to set the URL).
Re-run `pnpm cap:sync` after changing the env var.

## Release build

Configure signing in `android/app/build.gradle` (a keystore + `signingConfigs`),
then `cd android && ./gradlew assembleRelease` (or `bundleRelease` for an AAB).
