'use client';

import React from 'react';
import { useActiveSession, useLiveCount } from '@/lib/store';
import { StateChip } from '../StateChip';
import { NavChips } from '../GlobalNav';
import { AgentTurn, SessionChipState } from '@/lib/types';

/**
 * Top bar for landscape screens. Reads everything from the active session
 * plus the global live count for the multi-agent `${N} LIVE` chip.
 *
 * Left:  `~/repo · ⎇ branch · ● STATE · α`
 * Right: `M:SS elapsed · +A −R`
 */
export function LandAppBar() {
  const active = useActiveSession();
  const liveCount = useLiveCount();
  if (!active) return null;

  const chipState: SessionChipState =
    liveCount > 1 ? (`${liveCount} LIVE` as const) : active.state;

  const { added, removed } = totalDelta(active.turns);
  const elapsed = elapsedLabel(active.createdAt);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px 6px',
        fontFamily: 'var(--font-mono)',
        fontSize: 10.5,
        borderBottom: '1px dashed rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
        <NavChips />
        <span
          style={{
            color: 'var(--text-hi)',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          ~/{active.repo.name}
        </span>
        <span style={{ color: 'var(--cyan)', whiteSpace: 'nowrap' }}>
          ⎇ {active.branch}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <StateChip state={chipState} />
          <span style={{ color: 'var(--text-lo)' }}>· {active.greekId}</span>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10, color: 'var(--text-lo)', flexShrink: 0 }}>
        <span>{elapsed} elapsed</span>
        {(added > 0 || removed > 0) && (
          <span>
            <span style={{ color: 'var(--mint)' }}>+{added}</span>{' '}
            <span style={{ color: 'var(--rose)' }}>−{removed}</span>
          </span>
        )}
      </div>
    </div>
  );
}

function totalDelta(turns: { kind: 'user' | 'agent' }[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const t of turns as (AgentTurn | { kind: 'user' })[]) {
    if (t.kind === 'agent' && t.diff) {
      added += t.diff.added;
      removed += t.diff.removed;
    }
  }
  return { added, removed };
}

function elapsedLabel(createdAt: number): string {
  const s = Math.max(0, Math.floor((Date.now() - createdAt) / 1000));
  if (s < 60) return `0:${String(s).padStart(2, '0')}`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}
