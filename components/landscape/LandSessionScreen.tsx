'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveSession, useSessions } from '@/lib/store';
import { resumeAwaitingApprovals } from '@/lib/agent-runner';
import { LandTermPhone } from './LandTermPhone';
import { LandAppBar } from './LandAppBar';
import { LandBottomBar } from './LandBottomBar';
import { LandSessionPanes } from './LandSessionPanes';
import { LandListeningHero } from './LandListeningHero';
import { LandRunPanes } from './LandRunPanes';
import { AgentTurn } from '@/lib/types';

type Layout = 'plan' | 'listening' | 'run';

/**
 * Landscape entry. Dispatches to the right variant by inspecting the active
 * session's chip state:
 *
 *   REC                                    → 10 LandListeningHero
 *   has-ranToCompletion AND no awaiting    → 11 LandRunPanes (toggle via [S])
 *   otherwise                              → 09 LandSessionPanes
 *
 * The user can also toggle between 09 (PLAN focus) and 11 (SHELL focus) via
 * `[S] SHELL` / `[P] PLAN` chips in the bottom bar's hint slot.
 */
export function LandSessionScreen() {
  const router = useRouter();
  const active = useActiveSession();
  const order = useSessions((s) => s.order);
  const [preferShell, setPreferShell] = useState(false);

  // No active session → bounce, same logic as portrait SessionScreen.
  useEffect(() => {
    if (!active) {
      router.replace(order.length > 0 ? '/agents' : '/repos');
      return;
    }
    resumeAwaitingApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  if (!active) return null;

  const recording = active.state === 'REC';
  const latestAgent = [...active.turns].reverse().find((t) => t.kind === 'agent') as
    | AgentTurn
    | undefined;
  const anyComplete = !!latestAgent?.ranToCompletion;
  const awaiting = !!latestAgent?.plan.length && !latestAgent.approved;

  const layout: Layout =
    recording ? 'listening'
    : anyComplete && !awaiting && preferShell ? 'run'
    : 'plan';

  const mode = recording ? 'VOICE' : layout === 'run' ? 'NORMAL' : 'INSERT';
  const cmd =
    recording ? `recording… ${active.recElapsed.toFixed(1)}s`
    : layout === 'run' ? `${active.greekId} · ${active.name} · shipped`
    : `› ${active.greekId} · ${active.name}`;

  const hint =
    anyComplete && !awaiting && !recording
      ? preferShell
        ? '[P] PLAN'
        : '[S] SHELL'
      : undefined;

  return (
    <LandTermPhone>
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {layout !== 'listening' && <LandAppBar />}
        {layout === 'plan' && <LandSessionPanes />}
        {layout === 'run' && <LandRunPanes />}
        {layout === 'listening' && <LandListeningHero />}

        <div
          onClick={() => {
            if (anyComplete && !awaiting && !recording) setPreferShell((v) => !v);
          }}
          style={{ flexShrink: 0 }}
        >
          <LandBottomBar mode={mode} cmd={cmd} hint={hint} />
        </div>
      </div>
    </LandTermPhone>
  );
}
