'use client';

import { useEffect, useState } from 'react';
import { useSessions, useActiveSession, useSessionList, useLiveCount } from '@/lib/store';
import { repos } from '@/lib/mock-data';
import { useOrientation } from '@/lib/orientation';
import { useViewportBottom } from '@/lib/useViewportBottom';
import { useIsMobile } from '@/lib/useIsMobile';

/**
 * /debug/run — bypasses the mic + repo picker so you can step the multi-agent
 * loop with buttons. Renders the live store trace as it runs.
 */
export default function DebugRun() {
  const store = useSessions();
  const active = useActiveSession();
  const sessions = useSessionList();
  const liveCount = useLiveCount();
  const orientation = useOrientation();
  const kbOffset = useViewportBottom();
  const isMobile = useIsMobile();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, []);

  const submitOnActive = () => {
    let id = store.activeId;
    if (!id) id = store.spawnSession(repos[0]);
    store.submitTextTurn(id, 'add a reflection card at 9pm with a soft chime');
  };

  const approveOnActive = () => {
    if (store.activeId) store.approveLatestPlan(store.activeId);
  };

  const spawn3 = () => {
    const ids = [
      store.spawnSession(repos[0]),
      store.spawnSession(repos[1] ?? repos[0]),
      store.spawnSession(repos[2] ?? repos[0]),
    ];
    store.submitTextTurn(ids[0], 'add a reflection card at 9pm with a soft chime');
    setTimeout(() => store.submitTextTurn(ids[1], 'fix typo on welcome screen'), 200);
    setTimeout(() => store.submitTextTurn(ids[2], 'migrate database to add reflections table'), 400);
    store.setActive(ids[0]);
  };

  const lastAgent = active
    ? [...active.turns].reverse().find((t) => t.kind === 'agent')
    : null;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-deep)',
        color: 'var(--text-hi)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        padding: 24,
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: 24,
      }}
    >
      <section>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', margin: 0 }}>
          /debug/run
        </h1>
        <p style={{ color: 'var(--text-mid)', fontSize: 11 }}>
          smoke test the agent loop without a mic.
        </p>

        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
          <button
            onClick={submitOnActive}
            disabled={
              !!active && active.state !== 'IDLE' && active.state !== 'LIVE'
            }
            style={btn('var(--rose)')}
          >
            ▶ submit turn (on active)
          </button>
          <button
            onClick={approveOnActive}
            disabled={active?.state !== 'PLAN'}
            style={btn('var(--amber)')}
          >
            [A] approve plan
          </button>
          <button onClick={spawn3} style={btn('var(--violet)')}>
            ⫶ spawn 3 demo agents
          </button>
          <button onClick={() => store.resetAll()} style={btn('var(--text-lo)')}>
            ↻ reset all sessions
          </button>
        </div>

        <table
          style={{
            marginTop: 16,
            fontSize: 11,
            borderCollapse: 'collapse',
            width: '100%',
          }}
        >
          <tbody>
            <Row k="sessions"        v={String(sessions.length)} />
            <Row k="live"            v={String(liveCount)} />
            <Row k="active.id"       v={active?.id ?? '—'} />
            <Row k="active.name"     v={active?.name ?? '—'} />
            <Row k="active.state"    v={active?.state ?? '—'} />
            <Row k="active.turns"    v={String(active?.turns.length ?? 0)} />
            <Row k="last.plan"       v={String(lastAgent?.kind === 'agent' ? lastAgent.plan.length : 0)} />
            <Row k="last.diff"       v={lastAgent?.kind === 'agent' && lastAgent.diff ? 'yes' : 'no'} />
            <Row k="last.log"        v={String(lastAgent?.kind === 'agent' ? lastAgent.log.length : 0)} />
            <Row k="ranToCompletion" v={lastAgent?.kind === 'agent' && lastAgent.ranToCompletion ? 'yes' : 'no'} />
            <Row k="tick"            v={String(tick)} />
            <tr><td colSpan={2} style={{ paddingTop: 8 }}><span style={{ color: 'var(--text-lo)' }}>// mobile foundation</span></td></tr>
            <Row k="orientation"     v={orientation} />
            <Row k="isMobile (≤480)" v={isMobile ? 'yes' : 'no'} />
            <Row k="keyboard offset" v={`${kbOffset}px`} />
            <Row k="persisted"       v={typeof window !== 'undefined' && localStorage.getItem('lucid:sessions:v2') ? 'yes' : 'no'} />
          </tbody>
        </table>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16 }}>
          <a href="/session"   style={link()}>↗ /session</a>
          <a href="/agents"    style={link()}>↗ /agents</a>
          <a href="/files"     style={link()}>↗ /files</a>
          <a href="/settings"  style={link()}>↗ /settings</a>
        </div>
      </section>

      <section style={{ minWidth: 0 }}>
        <h2 style={{ fontSize: 12, color: 'var(--text-lo)', letterSpacing: 1, margin: '0 0 8px' }}>
          // RAW STORE TRACE
        </h2>
        <pre
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: 12,
            fontSize: 10.5,
            color: 'var(--text-mid)',
            overflow: 'auto',
            maxHeight: '70vh',
          }}
        >
{JSON.stringify(
  {
    activeId: store.activeId,
    order: store.order,
    sessions: sessions.map((s) => ({
      id: s.id,
      greekId: s.greekId,
      name: s.name,
      repo: s.repo.name,
      branch: s.branch,
      state: s.state,
      turnCount: s.turns.length,
      latestAgent: (() => {
        for (let i = s.turns.length - 1; i >= 0; i--) {
          const t = s.turns[i];
          if (t.kind !== 'agent') continue;
          return {
            plan: t.plan.map((p) => `${p.status} · ${p.label}`),
            diff: t.diff ? `${t.diff.path} +${t.diff.added} −${t.diff.removed}` : null,
            log: t.log.length,
            approved: t.approved,
            ranToCompletion: t.ranToCompletion,
          };
        }
        return null;
      })(),
    })),
  },
  null,
  2,
)}
        </pre>
      </section>
    </main>
  );
}

function btn(color: string): React.CSSProperties {
  return {
    appearance: 'none',
    border: `1px solid ${color}`,
    background: 'transparent',
    color,
    padding: '6px 10px',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.6,
    cursor: 'pointer',
    textAlign: 'left',
  };
}

function link(): React.CSSProperties {
  return {
    color: 'var(--cyan)',
    fontSize: 11,
    textDecoration: 'none',
  };
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr>
      <td style={{ color: 'var(--text-lo)', padding: '3px 8px 3px 0' }}>{k}</td>
      <td style={{ color: 'var(--text-hi)', padding: '3px 0' }}>{v}</td>
    </tr>
  );
}
