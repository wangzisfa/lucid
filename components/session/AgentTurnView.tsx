'use client';

import React from 'react';
import { AgentTurn } from '@/lib/types';
import { DiffBlock } from '../DiffBlock';
import { LogStream } from '../LogStream';
import { useActiveSession, useSessions } from '@/lib/store';

interface Props {
  turn: AgentTurn;
  /** Highlight the inline approval CTA (only when this turn awaits approval). */
  awaitingApproval: boolean;
}

const STATUS_GLYPH = {
  done:    { left: '├─ ✓', color: 'var(--mint)' },
  running: { left: '├─ ◐', color: 'var(--violet)' },
  pending: { left: '├─ ○', color: 'var(--text-lo)' },
} as const;

export function AgentTurnView({ turn, awaitingApproval }: Props) {
  const activeId = useActiveSession()?.id;
  const approve = useSessions((s) => s.approveLatestPlan);
  const onApprove = () => {
    if (activeId) approve(activeId);
  };
  const showHeader = turn.plan.length > 0 || turn.diff || turn.log.length > 0;
  const showPlan = turn.plan.length > 0;

  return (
    <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
      {showHeader && (
        <div style={{ color: 'var(--rose)' }}>
          <span>● lucid</span>
          {turn.thoughtFor > 0 && (
            <span style={{ color: 'var(--text-lo)' }}>
              {'  '}thought {turn.thoughtFor.toFixed(1)}s
              {turn.filesTouched > 0 ? ` · ${turn.filesTouched} files` : ''}
            </span>
          )}
        </div>
      )}

      {/* thinking placeholder */}
      {!showHeader && !showPlan && (
        <div style={{ color: 'var(--rose)' }}>
          ● lucid
          <span style={{ color: 'var(--text-mid)', marginLeft: 6 }}>
            thinking
            <span
              style={{
                display: 'inline-block',
                marginLeft: 2,
                animation: 'breathe 1s steps(2) infinite',
              }}
            >
              ▮
            </span>
          </span>
        </div>
      )}

      {/* plan */}
      {showPlan && (
        <div style={{ marginTop: 4, color: 'var(--text-mid)' }}>
          {turn.plan.map((item, i) => {
            const glyph = STATUS_GLYPH[item.status];
            const last = i === turn.plan.length - 1;
            return (
              <React.Fragment key={item.id}>
                <div>
                  <span
                    style={{
                      color: glyph.color,
                      animation: item.status === 'running' ? 'breathe 1.4s ease-in-out infinite' : undefined,
                    }}
                  >
                    {last ? glyph.left.replace('├', '└') : glyph.left}
                  </span>{' '}
                  <span
                    style={{
                      color: item.status === 'done'
                        ? 'var(--text-hi)'
                        : item.status === 'running'
                        ? 'var(--violet)'
                        : 'var(--text-mid)',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
                {item.comment && (
                  <div style={{ color: 'var(--text-lo)', paddingLeft: 16, fontSize: 10 }}>
                    {last ? '   └─' : '│   └─'} {item.comment}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* inline approval CTA */}
      {awaitingApproval && (
        <button
          type="button"
          onClick={onApprove}
          style={{
            marginTop: 10,
            width: '100%',
            padding: '8px 10px',
            background: 'rgba(255,197,107,0.08)',
            border: '1px solid var(--amber)',
            color: 'var(--amber)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 16px rgba(255,197,107,0.2)',
            animation: 'breathe 1.6s ease-in-out infinite',
          }}
        >
          [A] APPROVE PLAN
        </button>
      )}

      {/* diff */}
      {turn.diff && (
        <div style={{ marginTop: 10 }}>
          <DiffBlock
            path={turn.diff.path}
            added={turn.diff.added}
            removed={turn.diff.removed}
            lines={[...turn.diff.lines]}
          />
        </div>
      )}

      {/* log */}
      {turn.log.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <LogStream entries={turn.log} />
        </div>
      )}

      {/* ready */}
      {turn.ranToCompletion && (
        <div style={{ marginTop: 10, color: 'var(--text-mid)', fontSize: 11 }}>
          <span style={{ color: 'var(--rose)' }}>›</span> ready ·{' '}
          <span style={{ color: 'var(--cyan)' }}>ship it</span> ·{' '}
          <span style={{ color: 'var(--violet)' }}>another turn</span>
        </div>
      )}
    </div>
  );
}
