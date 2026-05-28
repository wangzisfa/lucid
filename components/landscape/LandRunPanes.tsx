'use client';

import React from 'react';
import { useActiveSession } from '@/lib/store';
import { AgentTurn, LogLine } from '@/lib/types';
import { Pane } from './Pane';
import { PaneSplit } from './PaneSplit';
import { LogStream } from '../LogStream';
import { Cursor } from '../Cursor';

/**
 * 11 — `SHELL │ PREVIEW │ DIFF` landscape layout, shown once the latest
 * agent turn has completed (`ranToCompletion`). All three panes read live
 * from the active session.
 */
export function LandRunPanes() {
  const active = useActiveSession();
  const agentTurns = (active?.turns ?? []).filter((t): t is AgentTurn => t.kind === 'agent');

  // Cumulative log across all completed turns + the running one.
  const cumulativeLog: LogLine[] = agentTurns.flatMap((t) => t.log);

  // Files-touched list (one row per diff observed across turns).
  const diffs = agentTurns
    .filter((t) => !!t.diff)
    .map((t) => t.diff!) as { path: string; added: number; removed: number }[];

  const lastDiff = diffs[diffs.length - 1];

  return (
    <PaneSplit initialWidths={[34, 38, 28]}>
      <Pane title="SHELL" badge="$ pnpm dev" tone="mint" footer="↑/↓ history">
        {cumulativeLog.length === 0 ? (
          <span style={{ color: 'var(--text-lo)' }}>no output yet</span>
        ) : (
          <LogStream entries={cumulativeLog} />
        )}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            marginTop: 4,
            color: 'var(--text-hi)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
          }}
        >
          <span style={{ color: 'var(--rose)' }}>$&nbsp;</span>
          <Cursor width={6} height={11} />
        </div>
      </Pane>

      <Pane title="PREVIEW" badge="iPhone 15 · 9:00pm" tone="rose" noPad>
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

      <Pane title="DIFF" badge={`${diffs.length} file${diffs.length === 1 ? '' : 's'}`} tone="violet" footer=":diffsplit">
        {diffs.length === 0 && (
          <span style={{ color: 'var(--text-lo)' }}>no diffs yet</span>
        )}
        {diffs.map((d, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '3px 0',
              borderBottom: i < diffs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              fontSize: 9.5,
            }}
          >
            <span style={{ color: 'var(--text-hi)' }}>{shortPath(d.path)}</span>
            <span>
              <span style={{ color: 'var(--mint)' }}>+{d.added}</span>{' '}
              {d.removed > 0 && (
                <span style={{ color: 'var(--rose)' }}>−{d.removed}</span>
              )}
            </span>
          </div>
        ))}

        {lastDiff && (
          <>
            <div style={{ marginTop: 10, color: 'var(--text-lo)', fontSize: 9 }}>
              // AGENT NOTES
            </div>
            <div
              style={{
                marginTop: 4,
                color: 'var(--text-mid)',
                fontSize: 9.5,
                lineHeight: 1.5,
              }}
            >
              kept chime soft. moon glyph uses unicode (◐) so it scales clean.
            </div>
          </>
        )}

        {agentTurns.some((t) => t.ranToCompletion) && (
          <button
            type="button"
            disabled
            style={{
              marginTop: 10,
              width: '100%',
              padding: 5,
              fontSize: 9,
              textAlign: 'center',
              background: 'var(--mint)',
              color: '#000',
              fontWeight: 700,
              letterSpacing: 0.6,
              border: 'none',
              fontFamily: 'var(--font-mono)',
              cursor: 'not-allowed',
            }}
          >
            [S] SHIP TO MAIN
          </button>
        )}
      </Pane>
    </PaneSplit>
  );
}

function shortPath(p: string): string {
  const parts = p.split('/');
  return parts[parts.length - 1] ?? p;
}
