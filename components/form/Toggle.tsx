'use client';

import React from 'react';

type ToggleColor = 'mint' | 'rose';

interface ToggleProps {
  on: boolean;
  color?: ToggleColor;
  onChange?: (next: boolean) => void;
  /** Tab-focusable. Space flips. */
  ariaLabel?: string;
}

const TONE: Record<ToggleColor, string> = {
  mint: 'var(--mint)',
  rose: 'var(--rose)',
};

/**
 * Two-chip ON/OFF toggle, matching `D_Settings_Land`.
 * Tap either chip to set that value explicitly; space flips when focused.
 */
export function Toggle({ on, color = 'mint', onChange, ariaLabel }: ToggleProps) {
  const c = TONE[color];

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange?.(!on);
    }
  };

  return (
    <span
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKey}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        display: 'inline-flex',
        gap: 3,
        outline: 'none',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <span
        onPointerDown={(e) => {
          e.preventDefault();
          if (!on) onChange?.(true);
        }}
        style={{
          padding: '1px 6px',
          background: on ? c : 'transparent',
          color: on ? '#000' : 'var(--text-lo)',
          border: `1px solid ${on ? c : 'rgba(255,255,255,0.12)'}`,
          fontWeight: 700,
          letterSpacing: 0.5,
        }}
      >
        ON
      </span>
      <span
        onPointerDown={(e) => {
          e.preventDefault();
          if (on) onChange?.(false);
        }}
        style={{
          padding: '1px 6px',
          background: !on ? 'var(--text-lo)' : 'transparent',
          color: !on ? '#000' : 'var(--text-lo)',
          border: `1px solid ${!on ? 'var(--text-lo)' : 'rgba(255,255,255,0.12)'}`,
          fontWeight: 700,
          letterSpacing: 0.5,
        }}
      >
        OFF
      </span>
    </span>
  );
}
