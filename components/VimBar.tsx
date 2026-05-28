import React from 'react';

type VimMode = 'NORMAL' | 'INSERT' | 'VOICE' | 'VISUAL';

interface VimBarProps {
  mode?: VimMode;
  cmd?: string;
  /** Show the blinking caret after the command? */
  cursor?: boolean;
  /** Right-side hint, defaults to ":q :w". */
  hint?: string;
}

const MODE_BG: Record<VimMode, string> = {
  NORMAL: '#1a1525',
  INSERT: 'var(--cyan)',
  VOICE:  'var(--violet)',
  VISUAL: 'var(--rose)',
};

const MODE_FG: Record<VimMode, string> = {
  NORMAL: 'var(--text-hi)',
  INSERT: '#000',
  VOICE:  '#000',
  VISUAL: '#000',
};

/**
 * Vim-style command bar at the bottom of every portrait screen.
 * Mode chip · command line · hint. Caret blinks if `cursor` true.
 */
export function VimBar({ mode = 'NORMAL', cmd = '', cursor = true, hint = ':q  :w' }: VimBarProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 26,
        left: 0,
        right: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        height: 28,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 5,
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
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {cmd}
        {cursor && (
          <span
            style={{
              display: 'inline-block',
              width: 7,
              height: 12,
              background: 'var(--text-hi)',
              marginLeft: 2,
              verticalAlign: 'text-bottom',
              animation: 'breathe 1s steps(2, end) infinite',
            }}
          />
        )}
      </span>
      <span style={{ padding: '0 8px', color: 'var(--text-lo)', whiteSpace: 'pre' }}>{hint}</span>
    </div>
  );
}
