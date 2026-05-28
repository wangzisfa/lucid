'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSessions } from '@/lib/store';
import { Session, chipTone, toneColor } from '@/lib/types';
import { BlockWave } from '../BlockWave';
import { IconClose } from '../icons';

interface Props {
  session: Session;
  active: boolean;
}

const CHIP_LABEL: Record<string, string> = {
  IDLE:  'IDLE',
  GEN:   'GEN',
  REC:   'REC',
  STT:   'STT',
  PLAN:  'WAIT',
  LIVE:  'DONE',
  EDIT:  'EDIT',
  CONF:  'CONF',
  KEYS:  'KEYS',
  DEPLOY: 'SHIP',
  SHIP:  'SHIP',
};

/**
 * One card in the `/agents` list. Tap → setActive + /session. Close button
 * (X) removes the session from the store.
 */
export function SessionCard({ session, active }: Props) {
  const router = useRouter();
  const setActive = useSessions((s) => s.setActive);
  const closeSession = useSessions((s) => s.closeSession);

  const tone = chipTone(session.state);
  const color = toneColor(tone);
  const working = session.state === 'GEN' || session.state === 'REC';
  const lastLog = lastLogFor(session);
  const label = CHIP_LABEL[session.state] ?? session.state;

  const onOpen = () => {
    setActive(session.id);
    router.push('/session');
  };

  const onClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeSession(session.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{
        padding: 10,
        border: `1px solid ${color}66`,
        background: active ? `${color}11` : 'rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span
            style={{
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: color,
              color: '#000',
              fontWeight: 700,
              fontSize: 11,
              boxShadow: working ? `0 0 8px ${color}` : 'none',
              flexShrink: 0,
            }}
          >
            {session.greekId}
          </span>
          <span
            style={{
              color: 'var(--text-hi)',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {session.name}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span
            style={{
              fontSize: 9.5,
              padding: '1px 5px',
              letterSpacing: 0.5,
              color,
              border: `1px solid ${color}`,
              animation: working ? 'breathe 1.4s infinite' : 'none',
            }}
          >
            {label}
          </span>
          <button
            type="button"
            aria-label="close session"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-lo)',
              padding: 2,
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <IconClose size={10} />
          </button>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--text-mid)',
          fontSize: 10.5,
          minHeight: 18,
        }}
      >
        <span style={{ color: 'var(--text-lo)' }}>›</span>
        <span
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {lastLog}
        </span>
        {working && <BlockWave count={10} color={color} active height={14} />}
      </div>
      <div style={{ display: 'flex', gap: 8, color: 'var(--text-lo)', fontSize: 9.5 }}>
        <span>{session.repo.name}</span>
        <span>·</span>
        <span style={{ color: 'var(--cyan)' }}>⎇ {session.branch}</span>
        <span style={{ marginLeft: 'auto' }}>{relativeAge(session.createdAt)}</span>
      </div>
    </div>
  );
}

function lastLogFor(session: Session): string {
  if (session.state === 'REC') return 'listening…';
  if (session.state === 'STT') return 'transcribing…';
  for (let i = session.turns.length - 1; i >= 0; i--) {
    const t = session.turns[i];
    if (t.kind === 'agent') {
      const lastLine = t.log[t.log.length - 1];
      if (lastLine) return `${lastLine.prefix ?? ''} ${lastLine.text}`.trim();
      if (t.plan.length > 0 && !t.approved) return 'awaits your approval';
      if (t.plan.length > 0) {
        const done = t.plan.filter((p) => p.status === 'done').length;
        return `${done}/${t.plan.length} steps`;
      }
      return 'thinking…';
    }
    if (t.kind === 'user') return t.text;
  }
  return 'no turns yet';
}

function relativeAge(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}
