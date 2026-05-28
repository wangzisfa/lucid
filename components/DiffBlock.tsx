import React from 'react';

export type DiffLine =
  | { kind: '+'; text: string }
  | { kind: '-'; text: string }
  | { kind: ' '; text: string };

interface DiffBlockProps {
  path: string;
  added: number;
  removed: number;
  lines: DiffLine[];
}

const LINE_COLOR = {
  '+': 'var(--mint)',
  '-': 'var(--rose)',
  ' ': 'var(--text-mid)',
};

const LINE_BG = {
  '+': 'rgba(94,255,178,0.06)',
  '-': 'rgba(255,138,180,0.06)',
  ' ': 'transparent',
};

/**
 * Unified diff block: header (`path · +N −M`) + colored lines.
 * Matches the rectangular, no-corner aesthetic of variation-d.jsx D_Session.
 */
export function DiffBlock({ path, added, removed, lines }: DiffBlockProps) {
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          padding: '5px 8px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          color: 'var(--text-mid)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>{path}</span>
        <span>
          <span style={{ color: 'var(--mint)' }}>+{added}</span>{' '}
          <span style={{ color: 'var(--rose)' }}>−{removed}</span>
        </span>
      </div>
      <div style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)' }}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 10.5,
              whiteSpace: 'pre',
              color: LINE_COLOR[l.kind],
              background: LINE_BG[l.kind],
              marginLeft: -8,
              marginRight: -8,
              paddingLeft: 8,
              paddingRight: 8,
            }}
          >
            {l.kind} {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
