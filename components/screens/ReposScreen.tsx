'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TermPhone } from '../TermPhone';
import { TermAppBar } from '../TermAppBar';
import { VimBar } from '../VimBar';
import { Cursor } from '../Cursor';
import { repos } from '@/lib/mock-data';
import { toneColor } from '@/lib/types';
import { useSessions } from '@/lib/store';
import { Repo } from '@/lib/types';

/**
 * 02-repos — repo picker rendered as `lucid ls --recent`.
 *
 * Up/down arrows move the cursor, Enter opens the selected repo (loads it
 * into the session store + navigates to `/session`). Tap a row to open
 * directly.
 */
export function ReposScreen() {
  const router = useRouter();
  const spawnSession = useSessions((s) => s.spawnSession);
  const [cursor, setCursor] = useState(0);

  const open = (repo: Repo) => {
    // Each pick spawns a fresh session bound to this repo, sets it active,
    // and lands on /session. To re-enter an existing session, go through
    // /agents instead.
    spawnSession(repo);
    router.push('/session');
  };

  useEffect(() => {
    router.prefetch('/session');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setCursor((c) => Math.min(repos.length - 1, c + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        open(repos[cursor]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cursor, router]);

  return (
    <TermPhone>
      <TermAppBar project="" branch="-" state="IDLE" />
      <div
        style={{
          padding: '14px 18px 70px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11.5,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ color: 'var(--rose)' }}>$</span>
          <span style={{ color: 'var(--text-hi)' }}>lucid ls --recent</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '24px 1fr 56px 50px',
            gap: 8,
            color: 'var(--text-lo)',
            fontSize: 10,
            paddingBottom: 4,
            borderBottom: '1px dashed rgba(255,255,255,0.08)',
            marginBottom: 6,
          }}
        >
          <span></span>
          <span>NAME</span>
          <span>STATE</span>
          <span style={{ textAlign: 'right' }}>EDITED</span>
        </div>

        {repos.map((p, i) => {
          const idx = String(i + 1).padStart(2, '0');
          const isCursor = i === cursor;
          const stateColor = toneColor(p.tone === 'mid' ? 'mid' : p.tone);
          const stateBorder =
            p.tone === 'mint' ? 'rgba(94,255,178,0.5)'
            : p.tone === 'cyan' ? 'rgba(107,229,255,0.5)'
            : p.tone === 'rose' ? 'rgba(255,138,180,0.5)'
            : 'rgba(255,255,255,0.15)';

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => open(p)}
              onMouseEnter={() => setCursor(i)}
              style={{
                appearance: 'none',
                background: isCursor
                  ? 'linear-gradient(90deg, rgba(255,138,180,0.10), transparent)'
                  : 'transparent',
                border: 'none',
                width: 'calc(100% + 16px)',
                marginLeft: -8,
                marginRight: -8,
                padding: '8px',
                borderBottom: i < repos.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-mono)',
                fontSize: 11.5,
                color: 'inherit',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr 56px 50px',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <span style={{ color: 'var(--text-lo)' }}>{idx}</span>
                <span>
                  <div style={{ color: 'var(--text-hi)', fontWeight: 600 }}>
                    {isCursor && <span style={{ color: 'var(--rose)', marginRight: 4 }}>›</span>}
                    {p.name}
                  </div>
                  <div style={{ color: 'var(--text-lo)', fontSize: 10 }}>{p.stack}</div>
                </span>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: 0.5,
                    padding: '2px 4px',
                    color: stateColor,
                    border: `1px solid ${stateBorder}`,
                    textAlign: 'center',
                    display: 'inline-block',
                    width: 48,
                  }}
                >
                  {p.state}
                </span>
                <span style={{ textAlign: 'right', color: 'var(--text-lo)', fontSize: 10 }}>
                  {p.ageLabel}
                </span>
              </div>
            </button>
          );
        })}

        <div style={{ marginTop: 12, color: 'var(--text-lo)', fontSize: 10 }}>
          {repos.length} results · sorted by edited · use ↑/↓ to select · enter to open
        </div>

        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--rose)' }}>$</span>
          <Cursor height={13} />
        </div>
      </div>

      <VimBar mode="NORMAL" cmd={`:open ${String(cursor + 1).padStart(2, '0')}`} />
    </TermPhone>
  );
}
