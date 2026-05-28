import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lucid Terminal',
  description: 'Voice-first mobile coding agent · think it, speak it, watch it boot.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Lucid',
  appleWebApp: {
    capable: true,
    title: 'Lucid',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [{ url: '/icon-512.svg', type: 'image/svg+xml' }],
    apple: '/icon-512.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  // Disable user-scaling so pinch-zoom doesn't fight the hold-mic gesture.
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#07060f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
