'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TermPhone } from '../TermPhone';
import { TermAppBar } from '../TermAppBar';
import { VimBar } from '../VimBar';
import { useSettings } from '@/lib/settings-store';

type Tone = 'rose' | 'cyan' | 'violet' | 'mint';

const TONE: Record<Tone, string> = {
  rose:   'var(--rose)',
  cyan:   'var(--cyan)',
  violet: 'var(--violet)',
  mint:   'var(--mint)',
};

interface Section {
  key: string;
  tone: Tone;
  route?: string;
  badge?: string;
  summary: (s: ReturnType<typeof useSettings.getState>) => string;
}

const SECTIONS: Section[] = [
  {
    key: 'agent',
    tone: 'rose',
    route: '/settings/model',
    summary: (s) => `${s.agent.model} · ${humanContext(s.agent.contextWindow)} · ${s.agent.thinking}`,
  },
  {
    key: 'providers',
    tone: 'cyan',
    route: '/settings/providers',
    badge: 'NEW',
    summary: (s) => {
      const linked = countLinked(s);
      return `${linked} linked · ${6 - linked} empty · BYOK + lucid cloud`;
    },
  },
  {
    key: 'voice',
    tone: 'cyan',
    summary: (s) => `${s.voice.stt} · ${s.voice.hotkey} · vad ${s.voice.vad}`,
  },
  {
    key: 'approvals',
    tone: 'violet',
    summary: (s) =>
      `${s.agent.autoApprove ? 'auto-approve' : 'manual diffs'} · ${
        s.agent.verifyBeforeShip ? 'verify before ship' : 'no verify'
      }`,
  },
  {
    key: 'memory',
    tone: 'mint',
    summary: () => 'project + global · 142 turns kept',
  },
  {
    key: 'tools',
    tone: 'cyan',
    summary: () => 'bash · pnpm · vite · vercel',
  },
  {
    key: 'integrations',
    tone: 'mint',
    summary: () => 'github · vercel · supabase · 1 off',
  },
  {
    key: 'theme',
    tone: 'rose',
    summary: (s) => `${s.ui.theme} · ${s.ui.density} · ${s.ui.scanlines ? 'scanlines' : 'flat'}`,
  },
  {
    key: 'workspace',
    tone: 'violet',
    summary: () => 'idea-garden · main · .gitignore',
  },
  {
    key: 'account',
    tone: 'cyan',
    summary: () => 'i@example.com · pro · 142h used',
  },
  {
    key: 'danger',
    tone: 'rose',
    summary: () => 'reset · clear cache · sign out',
  },
];

function countLinked(s: ReturnType<typeof useSettings.getState>): number {
  let n = 0;
  if (s.providers.anthropicKey) n++;
  if (s.providers.openaiKey) n++;
  if (s.providers.googleKey) n++;
  if (s.providers.ollamaUrl) n++;
  // lucid-cloud is always "PRO" — counts as linked for the summary
  n++;
  return n;
}

function humanContext(c: number): string {
  if (c >= 1_000_000) return '1M';
  if (c >= 1000) return `${Math.round(c / 1000)}K`;
  return String(c);
}

/**
 * 12 — settings hub.
 *
 * Sectioned list with vim nav: `j/k` (or arrows) move the cursor, `Enter`
 * opens, `/` focuses a hidden filter input. Tap a row to open directly.
 */
export function SettingsHub() {
  const router = useRouter();
  const settings = useSettings();
  const [cursor, setCursor] = useState(0);
  const [filter, setFilter] = useState('');

  const filtered = useMemo(
    () => (filter ? SECTIONS.filter((s) => s.key.includes(filter.toLowerCase())) : SECTIONS),
    [filter],
  );
  const selected = filtered[Math.min(cursor, filtered.length - 1)];

  const open = (s: Section) => {
    if (s.route) router.push(s.route);
  };

  useEffect(() => {
    [
      '/settings/model',
      '/settings/providers',
      '/settings/raw',
    ].forEach((r) => router.prefetch(r));
  }, [router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setCursor((c) => Math.min(filtered.length - 1, c + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      } else if (e.key === 'Enter' || e.key === 'l') {
        e.preventDefault();
        if (selected) open(selected);
      } else if (e.key === '/') {
        e.preventDefault();
        const input = document.getElementById('hub-filter') as HTMLInputElement | null;
        input?.focus();
      } else if (e.key === 'Escape') {
        setFilter('');
        (document.activeElement as HTMLElement | null)?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtered.length, selected, router]);

  // keep cursor in range when filter shrinks list
  useEffect(() => {
    if (cursor >= filtered.length) setCursor(Math.max(0, filtered.length - 1));
  }, [filtered.length, cursor]);

  return (
    <TermPhone>
      <TermAppBar project="settings" branch="-" state="CONF" />
      <div
        style={{
          padding: '10px 14px 90px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11.5,
          position: 'relative',
          zIndex: 2,
          height: 'calc(100% - 80px)',
          overflowY: 'auto',
        }}
        className="no-scrollbar"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>:Settings</span>
          <span style={{ color: 'var(--text-lo)', fontSize: 9.5 }}>
            {filtered.length} sections · j/k · enter
          </span>
        </div>
        <div style={{ color: 'var(--text-lo)', fontSize: 9.5, marginBottom: 8 }}>
          // ~/.lucidrc · live
        </div>

        {/* hidden-ish filter — appears when `/` is pressed */}
        <div style={{ marginBottom: 8, display: filter ? 'flex' : 'none', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--rose)' }}>/</span>
          <input
            id="hub-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="filter"
            spellCheck={false}
            style={{
              background: 'transparent',
              color: 'var(--text-hi)',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              flex: 1,
              padding: 0,
            }}
          />
        </div>
        {/* invisible mount so `/` can focus it */}
        {!filter && (
          <input
            id="hub-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
            aria-hidden
            tabIndex={-1}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((s, i) => {
            const sel = s === selected;
            const summary = s.summary(settings);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => {
                  setCursor(i);
                  open(s);
                }}
                onPointerEnter={() => setCursor(i)}
                disabled={!s.route}
                style={{
                  appearance: 'none',
                  textAlign: 'left',
                  background: sel ? 'rgba(255,138,180,0.06)' : 'transparent',
                  borderLeft: sel ? '2px solid var(--rose)' : '2px solid transparent',
                  borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  borderTop: 'none',
                  borderRight: 'none',
                  padding: '6px 10px',
                  marginLeft: -10,
                  marginRight: -10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11.5,
                  color: 'inherit',
                  cursor: s.route ? 'pointer' : 'default',
                  opacity: s.route ? 1 : 0.7,
                }}
              >
                <span style={{ color: 'var(--text-lo)', width: 14 }}>{sel ? '›' : ' '}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: TONE[s.tone], fontWeight: 600 }}>[{s.key}]</span>
                    {s.badge && (
                      <span
                        style={{
                          fontSize: 8.5,
                          padding: '1px 4px',
                          letterSpacing: 0.6,
                          background: 'var(--mint)',
                          color: '#000',
                          fontWeight: 700,
                        }}
                      >
                        {s.badge}
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      color: 'var(--text-mid)',
                      fontSize: 10,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {summary}
                  </span>
                </div>
                <span style={{ color: 'var(--text-lo)' }}>→</span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 14,
            padding: 8,
            border: '1px dashed rgba(255,255,255,0.08)',
            color: 'var(--text-lo)',
            fontSize: 9.5,
            lineHeight: 1.6,
          }}
        >
          <div>
            <span
              style={{ color: 'var(--cyan)', cursor: 'pointer' }}
              onClick={() => router.push('/settings/raw')}
            >
              :e
            </span>{' '}
            edit raw .lucidrc
          </div>
          <div>
            <span style={{ color: 'var(--cyan)' }}>:reload</span> reload config without restart
          </div>
          <div>
            <span style={{ color: 'var(--rose)', cursor: 'pointer' }} onClick={() => settings.reset()}>
              :reset
            </span>{' '}
            revert to defaults
          </div>
        </div>
      </div>
      <VimBar mode="NORMAL" cmd=":settings" hint="/filter · enter · :e raw" />
    </TermPhone>
  );
}

// re-export for the keyboard tests
export const __sections = SECTIONS;
