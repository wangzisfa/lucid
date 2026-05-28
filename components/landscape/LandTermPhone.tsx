'use client';

import React, { useState } from 'react';
import { useIsMobile } from '@/lib/useIsMobile';
import { PhoneRootContext } from '../phone-root';

interface LandTermPhoneProps {
  children: React.ReactNode;
  scanlines?: boolean;
  /**
   * - `true`   → always 660×320 rounded rect (design grid, desktop demo)
   * - `false`  → always fullbleed viewport (used in real landscape orientation)
   * - omitted  → auto: fullbleed on small viewports, framed on desktop
   */
  framed?: boolean;
}

/**
 * Landscape variant of `<TermPhone>`. 660×320 rounded rect with the dynamic
 * island rotated to the left edge and the home indicator on the right edge.
 *
 * Auto fullbleed on small viewports (same threshold as the portrait phone);
 * in that mode the simulated island + home indicator are hidden — the OS
 * renders the real ones — and content respects `env(safe-area-inset-*)` so
 * the notch never overlaps a pane.
 */
export function LandTermPhone({
  children,
  scanlines = true,
  framed,
}: LandTermPhoneProps) {
  const isMobile = useIsMobile();
  const isFramed = framed ?? !isMobile;
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  const phoneStyle: React.CSSProperties = isFramed
    ? {
        width: 660,
        height: 320,
        borderRadius: 38,
        boxShadow:
          '0 0 0 1.5px rgba(255,255,255,0.06), 0 30px 80px -20px rgba(0,0,0,0.7)',
      }
    : {
        width: '100vw',
        height: '100svh',
        borderRadius: 0,
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

        {/* simulated island + home indicator only when framed (design grid).
            On real device landscape, the OS renders them. */}
        {isFramed && (
          <>
            {/* dynamic island — left edge */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                left: 11,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 37,
                height: 126,
                borderRadius: 24,
                background: '#000',
                zIndex: 50,
              }}
            />
            {/* status icons top-right */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 22,
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-hi)',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                zIndex: 40,
              }}
            >
              <span style={{ opacity: 0.7 }}>
                <svg width={14} height={9} viewBox="0 0 19 12" aria-hidden>
                  <rect x={0}    y={7.5} width={3.2} height={4.5} rx={0.7} fill="currentColor" />
                  <rect x={4.8}  y={5}   width={3.2} height={7}   rx={0.7} fill="currentColor" />
                  <rect x={9.6}  y={2.5} width={3.2} height={9.5} rx={0.7} fill="currentColor" />
                  <rect x={14.4} y={0}   width={3.2} height={12}  rx={0.7} fill="currentColor" />
                </svg>
              </span>
              <span style={{ opacity: 0.7 }}>
                <svg width={18} height={9} viewBox="0 0 27 13" aria-hidden>
                  <rect x={0.5} y={0.5} width={23} height={12} rx={3.5} stroke="currentColor" strokeOpacity={0.4} fill="none" />
                  <rect x={2}   y={2}   width={17} height={9}  rx={2}   fill="currentColor" />
                </svg>
              </span>
              <span>09:41</span>
            </div>
            {/* home indicator — right edge, rotated */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%) rotate(90deg)',
                width: 110,
                height: 5,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.28)',
                transformOrigin: 'center',
                zIndex: 5,
              }}
            />
          </>
        )}

        {/* content area — inset to clear the island/home-indicator in framed
            mode, and to respect safe-area on real mobile landscape */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: isFramed ? 60 : 'var(--safe-left)',
            right: isFramed ? 18 : 'var(--safe-right)',
          }}
        >
          {children}
        </div>
      </div>
      </PhoneRootContext.Provider>
    </div>
  );
}
