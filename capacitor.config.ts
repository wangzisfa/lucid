import type { CapacitorConfig } from '@capacitor/cli';

// Lucid Terminal's agent loop runs server-side (`/api/agent/run` SSE +
// @anthropic-ai/claude-agent-sdk on Node), so the app can't run it on-device.
// There are two ways to package it:
//
//   1. Demo bundle (recommended): set LUCID_MOBILE_DEMO=1 and build the static
//      client into `out/` (see `pnpm mobile:export`). The app opens into the
//      real UI offline; the user configures their server URL + API key in
//      Settings › providers, and agent turns hit that remote server.
//
//   2. Remote-URL shell: set LUCID_MOBILE_SERVER_URL=https://your-server. The
//      WebView just loads that deployed instance directly.
//
// With neither set, the WebView shows the mobile/www/index.html placeholder.
const serverUrl = process.env.LUCID_MOBILE_SERVER_URL?.trim();
const demo = process.env.LUCID_MOBILE_DEMO === '1';

const config: CapacitorConfig = {
  appId: 'com.lucidterminal.app',
  appName: 'Lucid Terminal',
  webDir: demo ? 'out' : 'mobile/www',
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
