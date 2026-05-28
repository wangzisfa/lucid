'use client';

import React from 'react';

type StepperColor = 'cyan' | 'violet' | 'rose' | 'mint';

interface StepperProps<T extends string> {
  value: T;
  options: readonly T[];
  color?: StepperColor;
  onChange?: (next: T) => void;
}

const TONE: Record<StepperColor, string> = {
  cyan:   'var(--cyan)',
  violet: 'var(--violet)',
  rose:   'var(--rose)',
  mint:   'var(--mint)',
};

const TONE_SOFT: Record<StepperColor, string> = {
  cyan:   'rgba(107,229,255,0.33)',
  violet: 'rgba(139,111,255,0.33)',
  rose:   'rgba(255,138,180,0.33)',
  mint:   'rgba(94,255,178,0.33)',
};

/**
 * `< value >` stepper. `<` / `>` keys rotate when focused.
 * Click the arrows to rotate by tap.
 */
export function Stepper<T extends string>({
  value,
  options,
  color = 'cyan',
  onChange,
}: StepperProps<T>) {
  const c = TONE[color];
  const idx = Math.max(0, options.indexOf(value));

  const step = (delta: 1 | -1) => {
    if (options.length === 0) return;
    const next = (idx + delta + options.length) % options.length;
    if (next !== idx) onChange?.(options[next]);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === '<' || e.key === 'ArrowLeft' || e.key === ',') {
      e.preventDefault();
      step(-1);
    } else if (e.key === '>' || e.key === 'ArrowRight' || e.key === '.') {
      e.preventDefault();
      step(1);
    }
  };

  return (
    <span
      role="listbox"
      aria-label="stepper"
      tabIndex={0}
      onKeyDown={handleKey}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10.5,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '1px 4px',
        border: `1px solid ${TONE_SOFT[color]}`,
        outline: 'none',
        userSelect: 'none',
      }}
    >
      <span
        onPointerDown={(e) => {
          e.preventDefault();
          step(-1);
        }}
        style={{ color: 'var(--text-lo)', cursor: 'pointer', padding: '0 2px' }}
      >
        {'<'}
      </span>
      <span style={{ color: c, fontWeight: 600 }}>{value}</span>
      <span
        onPointerDown={(e) => {
          e.preventDefault();
          step(1);
        }}
        style={{ color: 'var(--text-lo)', cursor: 'pointer', padding: '0 2px' }}
      >
        {'>'}
      </span>
    </span>
  );
}
