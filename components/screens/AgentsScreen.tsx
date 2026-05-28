'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TermPhone } from '../TermPhone';
import { TermAppBar } from '../TermAppBar';
import { VimBar } from '../VimBar';
import { useActiveSession, useLiveCount, useSessionList } from '@/lib/store';
import { resumeAwaitingApprovals } from '@/lib/agent-runner';
import { SessionCard } from '../agents/SessionCard';
import { SpawnRow } from '../agents/SpawnRow';

/**
 * 08-agents — parallel agent sessions. Shows the list of sessions, lets you
 * switch the active one (tap a card), close one (X), or spawn a new one
 * (bottom dashed row).
 *
 * App-bar chip:
 *   - 0 sessions   → `IDLE`
 *   - 1 session    → that session's chip state
 *   - N>1 live     → `N LIVE`
 *   - else         → the active session's state
 */
export function AgentsScreen() {
  const router = useRouter();
  const sessions = useSessionList();
  const active = useActiveSession();
  const liveCount = useLiveCount();

  // Re-attach runners after a reload that left turns awaiting approval.
  useEffect(() => {
    resumeAwaitingApprovals();
  }, []);

  // No sessions at all → kick to the repo picker to spawn the first one.
  useEffect(() => {
    if (sessions.length === 0) router.replace('/repos');
  }, [sessions.length, router]);

  const chipState =
    sessions.length === 0 ? 'IDLE'
    : liveCount > 1 ? (`${liveCount} LIVE` as const)
    : (active?.state ?? 'IDLE');

  return (
    <TermPhone>
      <TermAppBar project="agents" branch="-" state={chipState} />
      <div
        className="no-scrollbar"
        style={{
          padding: '10px 14px 90px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          position: 'relative',
          zIndex: 2,
          height: 'calc(100% - 60px)',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>:Agents</span>
          <span style={{ color: 'var(--text-lo)', fontSize: 10 }}>
            {sessions.length} session{sessions.length === 1 ? '' : 's'}
            {liveCount > 0 && (
              <>
                {' · '}
                <span style={{ color: 'var(--mint)' }}>{liveCount} live</span>
              </>
            )}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              active={active?.id === s.id}
            />
          ))}
        </div>

        <SpawnRow />

        <div style={{ marginTop: 12, color: 'var(--text-lo)', fontSize: 9.5 }}>
          tap a card to switch · X to close · spawn pulls repos[0]
        </div>
      </div>

      <VimBar mode="NORMAL" cmd=":agent spawn" />
    </TermPhone>
  );
}
