/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // MOBILE_EXPORT=1 emits a static client bundle (`out/`) for the Capacitor
  // shell to bundle, so the app opens into the real UI offline. The server
  // `app/api/*` routes can't be statically exported, so scripts/mobile-export.mjs
  // moves them aside for the duration of this build. Agent turns then hit the
  // remote server configured in-app (Settings › providers › server url).
  ...(process.env.MOBILE_EXPORT === '1'
    ? { output: 'export', images: { unoptimized: true } }
    : {}),
};

module.exports = nextConfig;
