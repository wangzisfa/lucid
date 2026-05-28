'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Show the dev nav strip at the top? Off by default. */
  devNav?: boolean;
}

/**
 * Centers a single phone-framed screen on the page.
 * Used by `/`, `/repos`, `/session`, etc. No navigation chrome unless
 * `devNav` is on — boot et al. are meant to feel like the real app.
 */
export function ScreenStage({ children, devNav = false }: Props) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-deep)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        gap: 12,
      }}
    >
      {devNav && (
        <nav
          style={{
            position: 'fixed',
            top: 12,
            right: 12,
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
