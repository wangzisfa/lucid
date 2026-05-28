'use client';

import React, { useState } from 'react';
import { PhoneRootContext } from './phone-root';

interface TermPhoneProps {
  children: React.ReactNode;
  scanlines?: boolean;
}

/**
 * The terminal-aesthetic phone container — always fullbleed.
 *
 * The simulated iOS chrome (09:41 status bar, notch, home indicator) is gone:
 * the app runs edge-to-edge like a native mobile app and lets the real OS draw
 * its own status bar / gesture pill. Content is inset by `env(safe-area-inset-*)`
 * so it never sits under the real notch or home indicator.
 *
 * Layers, back-to-front:
 *   1. dark gradient   — base canvas, extends behind the notch
 *   2. faint 16px grid — radial-masked, dense at top
 *   3. rose ember      — the single neon accent per screen (top-right blur)
 *   4. scanlines       — static, never animated
 *   5. screen content  — the route, inset by the safe area
 */
export function TermPhone({ children, scanlines = true }: TermPhoneProps) {
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setRootEl}
      style={{
        width: '100vw',
        height: '100svh',
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      <PhoneRootContext.Provider value={rootEl}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #08070f 0%, #050409 100%)',
        }}
      >
        {/* grid */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '16px 16px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 30%, black 30%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 30%, black 30%, transparent 95%)',
            pointerEvents: 'none',
          }}
        />
        {/* rose ember */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -120,
            right: -100,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,107,157,0.22), transparent 70%)',
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }}
        />
        {/* scanlines */}
        {scanlines && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, transparent 1px, transparent 2px, rgba(255,255,255,0.018) 3px)',
              mixBlendMode: 'overlay',
              opacity: 0.7,
            }}
          />
        )}

        {/* safe-area inset wrapper — keeps content clear of the real OS notch
            and home indicator while the chrome above extends behind them. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            paddingTop:    'var(--safe-top)',
            paddingBottom: 'var(--safe-bottom)',
            paddingLeft:   'var(--safe-left)',
            paddingRight:  'var(--safe-right)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            {children}
          </div>
        </div>
      </div>
      </PhoneRootContext.Provider>
    </div>
  );
}
