'use client';

import React, { useCallback, useRef } from 'react';

type BarColor = 'cyan' | 'mint' | 'rose' | 'violet' | 'amber';

interface TermBarProps {
  /** Fraction 0..1. */
  value: number;
  /** Cell count of the bar. */
  max?: number;
  color?: BarColor;
  /** Step in cell units. Default = 1 cell. */
  step?: number;
  /** Called with a value 0..1 when the user drags or taps a cell. */
  onChange?: (next: number) => void;
  /** Disable drag/tap. */
  readOnly?: boolean;
}

const TONE: Record<BarColor, string> = {
  cyan:   'var(--cyan)',
  mint:   'var(--mint)',
  rose:   'var(--rose)',
  violet: 'var(--violet)',
  amber:  'var(--amber)',
};

/**
 * ASCII slider — `[████░░░░]`. The block run is `Math.round(value * max)` cells.
 *
 * When `onChange` is provided, the bar is interactive:
 * - tap any cell → that cell's value
 * - press + drag → continuous update
 * - arrow keys (when focused) → ± one step
 */
export function TermBar({
  value,
  max = 18,
  color = 'mint',
  step = 1,
  onChange,
  readOnly,
}: TermBarProps) {
  const v = Math.min(1, Math.max(0, value));
  const fill = Math.round(v * max);
  const rowRef = useRef<HTMLSpanElement | null>(null);

  const fromX = useCallback(
    (clientX: number) => {
      const row = rowRef.current;
      if (!row) return v;
      const rect = row.getBoundingClientRect();
      const x = clientX - rect.left;
      const cellW = rect.width / max;
      // round to the nearest cell index, clamp
      const cell = Math.max(0, Math.min(max, Math.round(x / cellW)));
      return cell / max;
    },
    [max, v],
  );

  const interactive = !readOnly && !!onChange;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    onChange?.(fromX(e.clientX));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!interactive) return;
    if (e.buttons === 0) return; // only drag
    onChange?.(fromX(e.clientX));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive) return;
    const stepFrac = step / max;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange?.(Math.max(0, v - stepFrac));
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange?.(Math.min(1, v + stepFrac));
    } else if (e.key === 'Home') {
      onChange?.(0);
    } else if (e.key === 'End') {
      onChange?.(1);
    }
  };

  return (
    <span
      role={interactive ? 'slider' : undefined}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={v}
      tabIndex={interactive ? 0 : -1}
      onKeyDown={onKeyDown}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        display: 'inline-flex',
        alignItems: 'center',
        outline: 'none',
        userSelect: 'none',
        touchAction: 'none',
        cursor: interactive ? 'ew-resize' : 'default',
      }}
    >
      <span style={{ color: 'var(--text-lo)' }}>[</span>
      <span
        ref={rowRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        style={{ whiteSpace: 'pre', display: 'inline-block' }}
      >
        <span style={{ color: TONE[color] }}>{'█'.repeat(fill)}</span>
        <span style={{ color: 'var(--text-lo)' }}>{'░'.repeat(Math.max(0, max - fill))}</span>
      </span>
      <span style={{ color: 'var(--text-lo)' }}>]</span>
    </span>
  );
}
