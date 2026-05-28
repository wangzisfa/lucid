'use client';

import React from 'react';
import { useActiveSession, useSessions } from '@/lib/store';
import { AgentTurn } from '@/lib/types';
import { Pane } from './Pane';
import { PaneSplit } from './PaneSplit';
import { Syntax } from '../Syntax';

/**
 * 09 — `PLAN │ CODE │ PREVIEW` landscape layout.
 *
 * Default widths 28 / 38 / 34 per the design spec. Read live from the
 * active session — the same state that drives portrait `SessionScreen`,
 * so the diff/plan/log appear identically across orientations.
 */
export function LandSessionPanes() {
  const active = useActiveSession();
  const approve = useSessions((s) => s.approveLatestPlan);

  const latestAgent = active
    ? ([...active.turns].reverse().find((t) => t.kind === 'agent') as AgentTurn | undefined)
    : undefined;

  const awaiting = !!latestAgent && latestAgent.plan.length > 0 && !latestAgent.approved;
  const planDone =
    latestAgent ? latestAgent.plan.filter((p) => p.status === 'done').length : 0;
  const planTotal = latestAgent?.plan.length ?? 0;

  return (
    <PaneSplit initialWidths={[28, 38, 34]}>
      <Pane
        title="PLAN"
        badge={planTotal > 0 ? `${planDone}/${planTotal}` : undefined}
        tone="rose"
        footer="j/k · a:approve"
      >
        {latestAgent ? (
          <PlanTree turn={latestAgent} />
        ) : (
          <span style={{ color: 'var(--text-lo)' }}>no plan yet · hold mic to start</span>
        )}
        {awaiting && active && (
          <button
            type="button"
            onClick={() => approve(active.id)}
            style={{
              marginTop: 10,
              width: '100%',
              padding: 5,
              border: '1px solid var(--mint)',
              color: 'var(--mint)',
              fontSize: 9.5,
              textAlign: 'center',
              letterSpacing: 0.6,
              background: 'rgba(94,255,178,0.06)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              cursor: 'pointer',
              animation: 'breathe 1.6s ease-in-out infinite',
            }}
          >
            [A] APPROVE PLAN
          </button>
        )}
      </Pane>

      <Pane
        title="CODE"
        badge={latestAgent?.diff ? `${shortPath(latestAgent.diff.path)} +${latestAgent.diff.added}` : undefined}
        tone="cyan"
        footer="cmd-s save · gd diff"
      >
        {latestAgent?.diff ? (
          <CodeBlock lines={latestAgent.diff.lines.map((l) => l.text)} />
        ) : (
          <span style={{ color: 'var(--text-lo)' }}>no changes yet</span>
        )}
      </Pane>

      <Pane
        title="PREVIEW"
        badge="localhost · HMR"
        tone="mint"
        footer="● live · 142ms"
        noPad
      >
        <iframe
          src="/preview/reflection-card"
          title="reflection card live preview"
          style={{
            border: 'none',
            width: '100%',
            height: '100%',
            display: 'block',
            background: '#0a0a1a',
            colorScheme: 'dark',
          }}
        />
      </Pane>
    </PaneSplit>
  );
}

function PlanTree({ turn }: { turn: AgentTurn }) {
  return (
    <div style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
      {turn.plan.map((item, i) => {
        const last = i === turn.plan.length - 1;
        const glyph = `${last ? '└─' : '├─'}[${
          item.status === 'done' ? '✓' : item.status === 'running' ? '◐' : ' '
        }]`;
        const color =
          item.status === 'done'   ? 'var(--mint)'
          : item.status === 'running' ? 'var(--violet)'
          : 'var(--text-lo)';
        return (
          <div key={item.id}>
            <span
              style={{
                color,
                animation:
                  item.status === 'running' ? 'breathe 1.4s ease-in-out infinite' : undefined,
              }}
            >
              {glyph}
            </span>{' '}
            <span
              style={{
                color:
                  item.status === 'done'   ? 'var(--text-hi)'
                  : item.status === 'running' ? 'var(--violet)'
                  : 'var(--text-mid)',
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CodeBlock({ lines }: { lines: string[] }) {
  const code = lines.join('\n');
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <div
        aria-hidden
        style={{
          color: 'var(--text-lo)',
          fontSize: 9.5,
          textAlign: 'right',
          userSelect: 'none',
          lineHeight: 1.65,
        }}
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Syntax code={code} fontSize={10} />
      </div>
    </div>
  );
}

function shortPath(p: string): string {
  const parts = p.split('/');
  return parts[parts.length - 1] ?? p;
}
