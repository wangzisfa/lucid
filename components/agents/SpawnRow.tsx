'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSessions } from '@/lib/store';
import { repos } from '@/lib/mock-data';
import { Cursor } from '../Cursor';

/**
 * The bottom "+ spawn new agent" row on the agents screen.
 *
 * Tap → spawns a fresh session bound to `repos[0]` (the headline demo repo),
 * sets it active, navigates to `/session`. The fresh session lands on its
 * empty state — the user holds the mic from there to seed the first turn,
 * which auto-derives the session name from their transcript.
 */
export function SpawnRow() {
  const router = useRouter();
  const spawnSession = useSessions((s) => s.spawnSession);

  const onSpawn = () => {
    spawnSession(repos[0]);
    router.push('/session');
  };

  return (
    <button
      type="button"
      onPointerDown={(e) => e.preventDefault()}
      onClick={onSpawn}
      style={{
        appearance: 'none',
        width: '100%',
        marginTop: 12,
        padding: 10,
        border: '1px dashed rgba(255,255,255,0.15)',
        background: 'rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-lo)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ color: 'var(--rose)' }}>+</span>
      <span>spawn new agent · pick repo, then hold mic to name it</span>
      <span style={{ marginLeft: 'auto' }}>
        <Cursor width={6} height={12} />
      </span>
    </button>
  );
}
