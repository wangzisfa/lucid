'use client';

import React from 'react';
import { HoldMic } from '../HoldMic';

type Mode = 'NORMAL' | 'INSERT' | 'VOICE';

interface LandBottomBarProps {
  mode?: Mode;
  /** Command text shown next to the mode chip. */
  cmd?: string;
  /** Right-aligned helper (e.g. ":ship :open"). Optional. */
  hint?: string;
}

const MODE_BG: Record<Mode, string> = {
  NORMAL: '#1a1525',
  INSERT: 'var(--cyan)',
  VOICE:  'var(--rose)',
};
const MODE_FG: Record<Mode, string> = {
  NORMAL: 'var(--text-hi)',
  INSERT: '#000',
  VOICE:  '#000',
};

/**
 * Bottom command strip for landscape screens.
 * Mode chip · command line · HoldMic anchored right.
 */
export function LandBottomBar({ mode = 'INSERT', cmd = '', hint }: LandBottomBarProps) {
  return (
    <div
      style={{
        height: 30,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        background: 'rgba(0,0,0,0.6)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          padding: '0 8px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          background: MODE_BG[mode],
          color: MODE_FG[mode],
          fontWeight: 700,
          letterSpacing: 0.6,
        }}
      >
        {mode}
      </span>
      <span
        style={{
          padding: '0 10px',
          color: 'var(--text-mid)',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {cmd}
      </span>
      {hint && (
        <span style={{ padding: '0 8px', color: 'var(--text-lo)' }}>{hint}</span>
      )}
      <HoldMic size={30} />
    </div>
  );
}
