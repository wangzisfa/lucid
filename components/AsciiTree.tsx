import React from 'react';

export type TreeStatus = 'done' | 'running' | 'pending';

export interface TreeNode {
  /** Indent depth — used to draw the proper `├─ │  ` prefix. */
  depth: number;
  status: TreeStatus;
  label: string;
  /** Optional comment line shown beneath (paddingLeft 16, text-lo). */
  comment?: string;
  /** Last sibling at its depth — draws `└─` instead of `├─`. */
  last?: boolean;
}

const STATUS_GLYPH: Record<TreeStatus, string> = {
  done:    '[✓]',
  running: '[◐]',
  pending: '[ ]',
};

const STATUS_COLOR: Record<TreeStatus, string> = {
  done:    'var(--mint)',
  running: 'var(--violet)',
  pending: 'var(--text-lo)',
};

const STATUS_LABEL_COLOR: Record<TreeStatus, string> = {
  done:    'var(--text-hi)',
  running: 'var(--violet)',
  pending: 'var(--text-mid)',
};

/**
 * Plan / file tree rendered as ASCII glyphs.
 * Each node shows `├─[status] label`, with optional comment row underneath.
 */
export function AsciiTree({ nodes }: { nodes: TreeNode[] }) {
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, lineHeight: 1.55 }}>
      {nodes.map((n, i) => (
        <React.Fragment key={i}>
          <div>
            <span
              style={{
                color: STATUS_COLOR[n.status],
                animation: n.status === 'running' ? 'breathe 1.4s ease-in-out infinite' : undefined,
              }}
            >
              {n.last ? '└─' : '├─'}
              {STATUS_GLYPH[n.status]}
            </span>{' '}
            <span style={{ color: STATUS_LABEL_COLOR[n.status] }}>{n.label}</span>
          </div>
          {n.comment && (
            <div style={{ color: 'var(--text-lo)', paddingLeft: 16 }}>
              {n.last ? '   └─ ' : '│   └─ '}
              {n.comment}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
