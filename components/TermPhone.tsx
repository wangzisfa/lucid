'use client';

import React, { useState } from 'react';
import { useIsMobile } from '@/lib/useIsMobile';
import { PhoneRootContext } from './phone-root';

interface TermPhoneProps {
  children: React.ReactNode;
  scanlines?: boolean;
  /**
   * - `true`   → always 320×660 rounded rect (design grid, desktop demo)
   * - `false`  → always fullbleed viewport
   * - omitted  → auto: fullbleed on ≤480px, framed otherwise
   *
   * In fullbleed mode the simulated 09:41 status bar and home indicator
   * are hidden — the actual OS renders them. Content gets safe-area
   * padding so it stays clear of the notch and home indicator.
   */
  framed?: boolean;
}

/**
 * The terminal-aesthetic phone container.
 *
 * Layers, back-to-front:
 *   1. dark gradient                 — base canvas, extends behind the notch
 *   2. faint 16px grid               — radial-masked, dense at top
 *   3. rose ember (top-right blur)   — the single neon accent per screen
 *   4. scanlines overlay             — static, never animated
 *   5. iOS status bar (09:41 / wifi) — framed mode only
 *   6. screen content                — the route, gets safe-area inset
 *   7. home indicator                — framed mode only
 */
export function TermPhone({ children, scanlines = true, framed }: TermPhoneProps) {
  const isMobile = useIsMobile();
  const isFramed = framed ?? !isMobile;
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  const phoneStyle: React.CSSProperties = isFramed
    ? {
        width: 320,
        height: 660,
        borderRadius: 38,
        boxShadow: '0 0 0 1.5px rgba(255,255,255,0.06), 0 30px 80px -20px rgba(0,0,0,0.7)',
      }
    : {
        width: '100vw',
        height: '100svh',
        borderRadius: 0,
        // safe-area padding lives on the inner content layer, not the outer
        // gradient/grid/ember — those should extend behind the notch.
      };

  return (
    <div
      ref={setRootEl}
      style={{
        ...phoneStyle,
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

        {/* safe-area inset wrapper — only active fullbleed */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            paddingTop:    isFramed ? 0 : 'var(--safe-top)',
            paddingBottom: isFramed ? 0 : 'var(--safe-bottom)',
            paddingLeft:   isFramed ? 0 : 'var(--safe-left)',
            paddingRight:  isFramed ? 0 : 'var(--safe-right)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isFramed && <StatusBar />}
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            {children}
          </div>
        </div>

        {isFramed && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 110,
              height: 5,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.28)',
              zIndex: 5,
            }}
          />
        )}
      </div>
      </PhoneRootContext.Provider>
    </div>
  );
}

function StatusBar() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 24px 6px',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--text-hi)',
        position: 'relative',
        zIndex: 10,
        fontFamily: 'var(--font-mono)',
        flexShrink: 0,
      }}
    >
      <span>09:41</span>
      <span style={{ display: 'flex', gap: 4, alignItems: 'center', opacity: 0.85 }}>
        <svg width={14} height={9} viewBox="0 0 19 12" aria-hidden>
          <rect x={0}    y={7.5} width={3.2} height={4.5} rx={0.7} fill="currentColor" />
          <rect x={4.8}  y={5}   width={3.2} height={7}   rx={0.7} fill="currentColor" />
          <rect x={9.6}  y={2.5} width={3.2} height={9.5} rx={0.7} fill="currentColor" />
          <rect x={14.4} y={0}   width={3.2} height={12}  rx={0.7} fill="currentColor" />
        </svg>
        <svg width={18} height={9} viewBox="0 0 27 13" aria-hidden>
          <rect x={0.5} y={0.5} width={23} height={12} rx={3.5} stroke="currentColor" strokeOpacity={0.4} fill="none" />
          <rect x={2}   y={2}   width={17} height={9}  rx={2}   fill="currentColor" />
        </svg>
      </span>
    </div>
  );
}
