import React from 'react';
import { SessionChipState } from '@/lib/types';
import { StateChip } from './StateChip';
import { NavChips } from './GlobalNav';

interface TermAppBarProps {
  project?: string;
  branch?: string;
  state?: SessionChipState;
}

/**
 * Top bar: `[←] [≡] · ~/project · ⎇ branch · ● STATE`.
 * Dashed-bottom border separates it from the screen body.
 */
export function TermAppBar({
  project = 'idea-garden',
  branch = 'main',
  state = 'IDLE',
}: TermAppBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '4px 12px 10px',
        fontFamily: 'var(--font-mono)',
        fontSize: 10.5,
        color: 'var(--text-mid)',
        letterSpacing: 0.3,
        borderBottom: '1px dashed rgba(255,255,255,0.08)',
        position: 'relative',
        zIndex: 5,
      }}
    >
      <NavChips />
      <span
        style={{
          color: 'var(--text-hi)',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {project ? `~/${project}` : <span style={{ color: 'var(--text-lo)' }}>~</span>}
      </span>
      <span style={{ color: 'var(--cyan)', flexShrink: 0 }}>⎇ {branch}</span>
      <span style={{ flexShrink: 0 }}>
        <StateChip state={state} />
      </span>
    </div>
  );
}
