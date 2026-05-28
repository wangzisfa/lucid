'use client';

import React, { useState } from 'react';
import { PhoneRootContext } from '../phone-root';

interface LandTermPhoneProps {
  children: React.ReactNode;
  scanlines?: boolean;
}

/**
 * Landscape variant of `<TermPhone>` — always fullbleed.
 *
 * Like the portrait phone, the simulated island + status icons + home
 * indicator are gone; the OS draws the real ones. Content respects
 * `env(safe-area-inset-*)` so the notch never overlaps a pane.
 */
export function LandTermPhone({ children, scanlines = true }: LandTermPhoneProps) {
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
            maskImage:
              'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 95%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 95%)',
            pointerEvents: 'none',
          }}
        />
        {/* rose ember */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -80,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(255,107,157,0.22), transparent 70%)',
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

        {/* content area — inset by the real OS safe area on each side */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--safe-top)',
            bottom: 'var(--safe-bottom)',
            left: 'var(--safe-left)',
            right: 'var(--safe-right)',
          }}
        >
          {children}
        </div>
      </div>
      </PhoneRootContext.Provider>
    </div>
  );
}
