import React from 'react';
import { UserTurn } from '@/lib/types';
import { BlockWave } from '../BlockWave';

export function UserTurnView({ turn }: { turn: UserTurn }) {
  const durLabel = turn.duration
    ? `0:${String(Math.round(turn.duration * 10) / 10).padStart(2, '0')}`
    : undefined;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 6,
        marginBottom: 4,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
      }}
    >
      <span style={{ color: 'var(--cyan)' }}>›</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'var(--text-hi)' }}>{turn.text}</div>
        {turn.voice && (
          <div
            style={{
              color: 'var(--text-lo)',
              fontSize: 9.5,
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>voice · {durLabel ?? '—'}</span>
            <BlockWave count={14} active={false} color="var(--text-lo)" height={14} />
          </div>
        )}
      </div>
    </div>
  );
}
