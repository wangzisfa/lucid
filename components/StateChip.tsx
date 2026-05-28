import React from 'react';
import { SessionChipState, chipTone, toneColor } from '@/lib/types';

interface StateChipProps {
  state: SessionChipState;
}

/**
 * The two-letter status badge in TermAppBar — the most important UI signal.
 * Pulses on GEN/REC/PLAN; static otherwise. Accepts the multi-agent
 * `${N} LIVE` aggregate form as well.
 */
export function StateChip({ state }: StateChipProps) {
  const tone = chipTone(state);
  const color = toneColor(tone);
  const shouldPulse = state === 'GEN' || state === 'REC' || state === 'PLAN';
  const isInactive = state === 'IDLE';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        color,
        fontFamily: 'var(--font-mono)',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          background: 'currentColor',
          boxShadow: isInactive ? 'none' : '0 0 6px currentColor',
        }}
      />
      <span
        style={shouldPulse ? { animation: 'breathe 1.4s ease-in-out infinite' } : undefined}
      >
        {state}
      </span>
    </span>
  );
}
