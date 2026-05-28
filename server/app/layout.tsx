export const metadata = {
  title: 'Lucid Agent Server',
  description: 'Claude Agent SDK backend for the Lucid Terminal RN client.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
