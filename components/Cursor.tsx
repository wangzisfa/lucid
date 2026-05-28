import React from 'react';

interface CursorProps {
  /** Cursor color, default text-hi. */
  color?: string;
  /** Width × height in px. */
  width?: number;
  height?: number;
  /** Inline alignment relative to surrounding text. */
  align?: 'middle' | 'text-bottom' | 'baseline';
}

/**
 * The blinking terminal caret. Used inline after prompts and in transcripts.
 */
export function Cursor({
  color = 'var(--text-hi)',
  width = 7,
  height = 12,
  align = 'text-bottom',
}: CursorProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        width,
        height,
        background: color,
        marginLeft: 2,
        verticalAlign: align,
        animation: 'breathe 1s steps(2, end) infinite',
      }}
    />
  );
}
