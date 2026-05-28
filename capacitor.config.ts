import type { CapacitorConfig } from '@capacitor/cli';

// Lucid Terminal's agent loop runs server-side (`/api/agent/run` SSE +
// @anthropic-ai/claude-agent-sdk on Node), so the Android app is a native
// shell around a deployed Next.js instance. Point it at your deployment by
// setting LUCID_MOBILE_SERVER_URL before `cap sync` / a Gradle build, e.g.
//   LUCID_MOBILE_SERVER_URL=https://lucid.example.com pnpm cap sync android
// When unset, the WebView loads the bundled mobile/www/index.html, which
// just tells you to configure the URL — relative `/api/...` calls in the
// client need a real origin, which only the deployed server provides.
const serverUrl = process.env.LUCID_MOBILE_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: 'com.lucidterminal.app',
  appName: 'Lucid Terminal',
  webDir: 'mobile/www',
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          // Allow http:// only for LAN dev servers; https in production.
          cleartext: serverUrl.startsWith('http://'),
        },
      }
    : {}),
};

export default config;
