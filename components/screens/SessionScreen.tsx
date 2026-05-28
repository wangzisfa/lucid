'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TermPhone } from '../TermPhone';
import { TermAppBar } from '../TermAppBar';
import { VimBar } from '../VimBar';
import { Cursor } from '../Cursor';
import { useActiveSession, useSessions, useLiveCount } from '@/lib/store';
import { resumeAwaitingApprovals } from '@/lib/agent-runner';
import { useOrientation } from '@/lib/orientation';
import { UserTurnView } from '../session/UserTurnView';
import { AgentTurnView } from '../session/AgentTurnView';
import { ListeningOverlay } from '../session/ListeningOverlay';
import { InputBar } from '../session/InputBar';
import { PreviewSheet } from '../session/PreviewSheet';
import { LandSessionScreen } from '../landscape/LandSessionScreen';

/**
 * 03-session — the main coding screen, scoped to the **active session** in
 * `useSessions`. Switching the active session via `/agents` re-renders this
 * view against the new session's history; the dead session keeps its state
 * in the store untouched.
 *
 * Sub-views, by `session.state`:
 *   IDLE → empty prompt
 *   REC  → ListeningOverlay covers the feed
 *   STT/GEN/PLAN/LIVE → conversation feed renders all past turns
 *
 * The `[P] PREVIEW` chip opens PreviewSheet (iframe) once any turn has
 * reached LIVE. The `[F] FILES` chip routes to `/files`. The `[α] AGENTS`
 * chip routes to `/agents` and shows the count of live sessions.
 */
/**
 * Top-level dispatch: picks portrait vs landscape view from `useOrientation()`.
 * Both children read from the same session store, so a rotation mid-thinking
 * swaps the chrome without losing state.
 */
export function SessionScreen() {
  const orientation = useOrientation();
  if (orientation === 'landscape') return <LandSessionScreen />;
  return <PortraitSessionScreen />;
}

function PortraitSessionScreen() {
  const router = useRouter();
  const active = useActiveSession();
  const order = useSessions((s) => s.order);
  const liveCount = useLiveCount();
  const [previewOpen, setPreviewOpen] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // No active session → bounce. If at least one session exists, send to
  // /agents to pick. If none, send to /repos to spawn the first one.
  // Also: re-attach a runner to any session waiting on approval.
  useEffect(() => {
    if (!active) {
      router.replace(order.length > 0 ? '/agents' : '/repos');
      return;
    }
    resumeAwaitingApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  // auto-scroll feed as new things land
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [active?.turns, active?.state]);

  if (!active) return null;

  const { repo, branch, state, turns } = active;

  const lastAwaiting = (() => {
    for (let i = turns.length - 1; i >= 0; i--) {
      const t = turns[i];
      if (t.kind === 'agent' && t.plan.length > 0 && !t.approved) return t.id;
      if (t.kind === 'agent' && t.approved) return null;
    }
    return null;
  })();

  const anyLive = turns.some((t) => t.kind === 'agent' && t.ranToCompletion);
  const recording = state === 'REC';
  const chipState = liveCount > 1 ? (`${liveCount} LIVE` as const) : state;
  const showAgentsChip = order.length > 1;

  return (
    <TermPhone>
      <TermAppBar project={repo.name} branch={branch} state={chipState} />

      {/* preview chip — visible once anything has run */}
      {anyLive && !recording && (
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          style={chipStyle('var(--mint)', 'rgba(94,255,178,0.5)', 38)}
        >
          [P] PREVIEW
        </button>
      )}

      {/* files chip — visible once a repo is loaded */}
      {!recording && (
        <button
          type="button"
          onClick={() => router.push('/files')}
          style={chipStyle('var(--cyan)', 'rgba(107,229,255,0.5)', anyLive ? 64 : 38)}
        >
          [F] FILES
        </button>
      )}

      {/* agents chip — visible when >1 session exists */}
      {showAgentsChip && !recording && (
        <button
          type="button"
          onClick={() => router.push('/agents')}
          style={chipStyle(
            'var(--rose)',
            'rgba(255,138,180,0.5)',
            anyLive ? 90 : 64,
          )}
        >
          [α] AGENTS · {order.length}
        </button>
      )}

      {/* feed */}
      <div
        ref={feedRef}
        className="no-scrollbar"
        style={{
          padding: '10px 14px 100px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          lineHeight: 1.55,
          overflow: 'auto',
          height: 'calc(100% - 60px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {turns.length === 0 && !recording && (
          <EmptyState sessionName={active.name} greekId={active.greekId} />
        )}

        {turns.map((t) =>
          t.kind === 'user'
            ? <UserTurnView key={t.id} turn={t} />
            : <AgentTurnView key={t.id} turn={t} awaitingApproval={t.id === lastAwaiting} />
        )}

        {state === 'STT' && <InlineHint text="transcribing…" tone="cyan" />}
      </div>

      {recording && <ListeningOverlay />}

      <InputBar />

      {previewOpen && <PreviewSheet onClose={() => setPreviewOpen(false)} />}

      <VimBar
        mode={recording ? 'VOICE' : state === 'PLAN' ? 'NORMAL' : 'INSERT'}
        cmd={vimCmdFor(state, lastAwaiting != null)}
      />
    </TermPhone>
  );
}

function chipStyle(color: string, borderColor: string, top: number): React.CSSProperties {
  return {
    position: 'absolute',
    top,
    right: 12,
    zIndex: 5,
    padding: '2px 6px',
    background: 'transparent',
    border: `1px solid ${borderColor}`,
    color,
    fontFamily: 'var(--font-mono)',
    fontSize: 9.5,
    letterSpacing: 0.5,
    cursor: 'pointer',
  };
}

function vimCmdFor(state: string, awaiting: boolean): string {
  if (state === 'REC')  return 'recording…';
  if (state === 'STT')  return 'transcribing…';
  if (awaiting)         return ':approve';
  if (state === 'GEN')  return ':running';
  if (state === 'LIVE') return ':open preview';
  return 'hold mic or type';
}

function EmptyState({ sessionName, greekId }: { sessionName: string; greekId: string }) {
  const showsName = sessionName !== greekId;
  return (
    <div
      style={{
        color: 'var(--text-mid)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        padding: '4px 0',
      }}
    >
      <div style={{ color: 'var(--text-lo)' }}>
        # fresh session{' '}
        <span style={{ color: 'var(--rose)' }}>{greekId}</span>
        {showsName && <span style={{ color: 'var(--cyan)' }}> · {sessionName}</span>}
      </div>
      <div style={{ marginTop: 4 }}>
        <span style={{ color: 'var(--rose)' }}>›</span> hold the mic and say what you want to build
      </div>
      <div style={{ color: 'var(--text-lo)', marginTop: 6 }}>
        e.g.{' '}
        <span style={{ color: 'var(--cyan)' }}>
          add a reflection card at 9pm w/ soft chime
        </span>
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'var(--rose)' }}>$</span>
        <Cursor />
      </div>
    </div>
  );
}

function InlineHint({ text, tone }: { text: string; tone: 'cyan' | 'rose' }) {
  return (
    <div
      style={{
        marginTop: 8,
        padding: '6px 8px',
        border: `1px solid ${tone === 'cyan' ? 'var(--cyan)' : 'var(--rose)'}`,
        background:
          tone === 'cyan' ? 'rgba(107,229,255,0.06)' : 'rgba(255,138,180,0.06)',
        color: tone === 'cyan' ? 'var(--cyan)' : 'var(--rose)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10.5,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          background: 'currentColor',
          boxShadow: '0 0 6px currentColor',
          animation: 'breathe 0.6s infinite',
        }}
      />
      {text}
    </div>
  );
}
