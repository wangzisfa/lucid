'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Show the dev nav strip at the top? Off by default. */
  devNav?: boolean;
}

/**
 * Full-viewport host for a single screen. The screen itself (via `<TermPhone>`
 * / `<LandTermPhone>`) renders edge-to-edge, so this is just an unpadded
 * fullscreen container — no centering, no demo framing.
 */
export function ScreenStage({ children, devNav = false }: Props) {
  return (
    <main
      style={{
        width: '100vw',
        height: '100svh',
        background: 'var(--bg-deep)',
        overflow: 'hidden',
      }}
    >
      {devNav && (
        <nav
          style={{
            position: 'fixed',
            top: 'calc(var(--safe-top) + 8px)',
            right: 'calc(var(--safe-right) + 8px)',
            display: 'flex',
            gap: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-lo)',
            zIndex: 999,
          }}
        >
          <a href="/agents" style={{ color: 'var(--text-lo)', textDecoration: 'none' }}>
            /agents
          </a>
          <a href="/files" style={{ color: 'var(--text-lo)', textDecoration: 'none' }}>
            /files
          </a>
          <a href="/design" style={{ color: 'var(--text-lo)', textDecoration: 'none' }}>
            /design
          </a>
        </nav>
      )}
      {children}
    </main>
  );
}
