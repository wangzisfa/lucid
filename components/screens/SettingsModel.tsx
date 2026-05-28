'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TermPhone } from '../TermPhone';
import { TermAppBar } from '../TermAppBar';
import { VimBar } from '../VimBar';
import { Stepper } from '../form/Stepper';
import { TermBar } from '../form/TermBar';
import { Toggle } from '../form/Toggle';
import {
  CONTEXT_OPTIONS,
  ContextWindow,
  ModelId,
  ProviderId,
  THINKING_OPTIONS,
  Thinking,
  useSettings,
} from '@/lib/settings-store';

interface ModelRow {
  id: ModelId;
  note: string;
  tone: 'rose' | 'cyan' | 'violet' | 'mint';
  via: ProviderId;
}

const TONE = {
  rose:   'var(--rose)',
  cyan:   'var(--cyan)',
  violet: 'var(--violet)',
  mint:   'var(--mint)',
};

const TONE_SOFT = {
  rose:   'rgba(255,138,180,0.07)',
  cyan:   'rgba(107,229,255,0.07)',
  violet: 'rgba(139,111,255,0.07)',
  mint:   'rgba(94,255,178,0.07)',
};

const MODELS: ModelRow[] = [
  { id: 'claude-haiku-4',    note: 'fast · cheap',       tone: 'cyan',   via: 'anthropic' },
  { id: 'claude-sonnet-4.5', note: 'balanced · default', tone: 'rose',   via: 'anthropic' },
  { id: 'claude-opus-4.1',   note: 'deep · slow',        tone: 'violet', via: 'anthropic' },
  { id: 'gpt-5',             note: 'fast · cheap',       tone: 'mint',   via: 'openai'    },
  { id: 'gemini-2.5',        note: 'multimodal',         tone: 'cyan',   via: 'google'    },
  { id: 'qwen-32b',          note: 'on-device · 8 t/s',  tone: 'mint',   via: 'ollama'    },
];

function isLinked(via: ProviderId, s: ReturnType<typeof useSettings.getState>): boolean {
  switch (via) {
    case 'anthropic':   return !!s.providers.anthropicKey;
    case 'openai':      return !!s.providers.openaiKey;
    case 'google':      return !!s.providers.googleKey;
    case 'ollama':      return !!s.providers.ollamaUrl;
    case 'openrouter':  return false;
    case 'lucid-cloud': return true;
  }
}

function contextFraction(c: ContextWindow): number {
  // map the 3 stops onto a visual fraction
  if (c === 50_000) return 0.05;
  if (c === 200_000) return 0.2;
  return 1;
}

function nearestContext(frac: number): ContextWindow {
  // map drag fraction back to nearest stop using its visual position
  const stops: [number, ContextWindow][] = CONTEXT_OPTIONS.map((c) => [contextFraction(c), c]);
  let best = stops[0];
  let bestDelta = Math.abs(stops[0][0] - frac);
  for (const s of stops) {
    const d = Math.abs(s[0] - frac);
    if (d < bestDelta) {
      best = s;
      bestDelta = d;
    }
  }
  return best[1];
}

function fmtContext(c: ContextWindow): string {
  if (c >= 1_000_000) return '1,000,000 tokens';
  return `${c.toLocaleString('en-US')} tokens`;
}

/**
 * 14 — agent / model drilldown.
 */
export function SettingsModel() {
  const router = useRouter();
  const settings = useSettings();
  const a = settings.agent;
  const [prompt, setPrompt] = useState(a.systemPrompt);

  // sync external store edits (e.g. raw editor) back into the textarea
  useEffect(() => {
    setPrompt(a.systemPrompt);
  }, [a.systemPrompt]);

  // global shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (inField) return;
      if (e.key === 'Escape') router.push('/settings');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  const tokenEstimate = useMemo(() => Math.round(prompt.length / 4) + 6000, [prompt]);
  const cost = (tokenEstimate * 0.000003).toFixed(3);

  return (
    <TermPhone>
      <TermAppBar project="settings" branch="-" state="EDIT" />
      <div
        style={{
          padding: '10px 14px 90px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          lineHeight: 1.55,
          position: 'relative',
          zIndex: 2,
          height: 'calc(100% - 80px)',
          overflowY: 'auto',
        }}
        className="no-scrollbar"
      >
        {/* breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, marginBottom: 8 }}>
          <span
            style={{ color: 'var(--text-lo)', cursor: 'pointer' }}
            onClick={() => router.push('/settings')}
          >
            settings ›
          </span>
          <span style={{ color: 'var(--rose)', fontWeight: 600 }}>[agent]</span>
        </div>

        {/* MODEL */}
        <div style={{ color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>
          // MODEL <span>· routed via [providers]</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
          {MODELS.map((m) => {
            const sel = a.model === m.id;
            const linked = isLinked(m.via, settings);
            const tone = TONE[m.tone];
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => settings.setAgent('model', m.id)}
                style={{
                  appearance: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 8px',
                  border: `1px solid ${sel ? tone : 'rgba(255,255,255,0.08)'}`,
                  background: sel ? TONE_SOFT[m.tone] : 'rgba(0,0,0,0.2)',
                  opacity: linked ? 1 : 0.7,
                  color: 'inherit',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    color: sel ? tone : 'var(--text-lo)',
                    width: 12,
                  }}
                >
                  {sel ? '◉' : '○'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        color: sel ? 'var(--text-hi)' : 'var(--text-mid)',
                        fontWeight: sel ? 600 : 400,
                      }}
                    >
                      {m.id}
                    </span>
                    <span style={{ color: 'var(--text-lo)', fontSize: 9 }}>· {m.note}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 1,
                      fontSize: 8.5,
                    }}
                  >
                    <span style={{ color: 'var(--text-lo)' }}>via</span>
                    <span style={{ color: linked ? 'var(--cyan)' : 'var(--text-lo)' }}>{m.via}</span>
                    <span
                      style={{
                        padding: '0 4px',
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        color: linked ? 'var(--mint)' : 'var(--rose)',
                        border: `1px solid ${
                          linked ? 'rgba(94,255,178,0.5)' : 'rgba(255,138,180,0.5)'
                        }`,
                      }}
                    >
                      {linked ? 'KEY ✓' : 'NEEDS KEY'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 4, fontSize: 9.5, color: 'var(--text-lo)' }}>
          → add or test keys in{' '}
          <span
            style={{ color: 'var(--cyan)', cursor: 'pointer' }}
            onClick={() => router.push('/settings/providers')}
          >
            :settings providers
          </span>
        </div>

        {/* CONTEXT */}
        <div style={{ marginTop: 14, color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>
          // CONTEXT
        </div>
        <div
          style={{
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: 'var(--text-mid)' }}>window</span>
          <span style={{ color: 'var(--cyan)' }}>{fmtContext(a.contextWindow)}</span>
        </div>
        <div style={{ marginTop: 3 }}>
          <TermBar
            value={contextFraction(a.contextWindow)}
            max={20}
            color="cyan"
            onChange={(f) => settings.setAgent('contextWindow', nearestContext(f))}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 9,
            color: 'var(--text-lo)',
            marginTop: 2,
          }}
        >
          {CONTEXT_OPTIONS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => settings.setAgent('contextWindow', c)}
              style={{
                appearance: 'none',
                background: 'transparent',
                border: 'none',
                color: a.contextWindow === c ? 'var(--cyan)' : 'var(--text-lo)',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {c === 1_000_000 ? '1M' : `${c / 1000}K`}
            </button>
          ))}
        </div>

        {/* THINKING */}
        <div style={{ marginTop: 14, color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>
          // THINKING
        </div>
        <div
          style={{
            marginTop: 6,
            padding: 8,
            border: '1px solid rgba(139,111,255,0.3)',
            background: 'rgba(139,111,255,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: 'var(--text-mid)' }}>budget</span>
            <Stepper
              value={a.thinking}
              options={THINKING_OPTIONS}
              color="violet"
              onChange={(v) => settings.setAgent('thinking', v as Thinking)}
            />
          </div>
          <div style={{ marginTop: 6, color: 'var(--text-lo)', fontSize: 9.5, lineHeight: 1.5 }}>
            off · think · think-hard · think-harder
            <br />→ up to 32K reasoning tokens before each turn
          </div>
        </div>

        {/* TEMPERATURE */}
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ color: 'var(--text-lo)', fontSize: 9.5 }}>// TEMPERATURE</div>
            <div style={{ color: 'var(--text-mid)', marginTop: 2 }}>creativity</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--rose)', fontFamily: 'var(--font-mono)' }}>
              {a.temperature.toFixed(2)}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-lo)' }}>precise → wild</div>
          </div>
        </div>
        <div style={{ marginTop: 3 }}>
          <TermBar
            value={a.temperature}
            max={20}
            color="rose"
            onChange={(f) => settings.setAgent('temperature', Math.round(f * 100) / 100)}
          />
        </div>

        {/* SAFETY */}
        <div style={{ marginTop: 14, color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>
          // SAFETY
        </div>
        <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SafetyRow
            label="auto-approve diffs"
            color="rose"
            on={a.autoApprove}
            onChange={(v) => settings.setAgent('autoApprove', v)}
          />
          <SafetyRow
            label="verify before ship"
            color="mint"
            on={a.verifyBeforeShip}
            onChange={(v) => settings.setAgent('verifyBeforeShip', v)}
          />
          <SafetyRow
            label="allow shell exec"
            color="mint"
            on={a.allowShellExec}
            onChange={(v) => settings.setAgent('allowShellExec', v)}
          />
        </div>

        {/* SYSTEM PROMPT */}
        <div style={{ marginTop: 14, color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>
          // SYSTEM PROMPT
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onBlur={() => settings.setAgent('systemPrompt', prompt)}
          spellCheck={false}
          style={{
            marginTop: 4,
            width: '100%',
            minHeight: 96,
            padding: 8,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.4)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-mid)',
            lineHeight: 1.55,
            resize: 'vertical',
            outline: 'none',
          }}
        />

        {/* TOKEN ESTIMATE */}
        <div
          style={{
            marginTop: 12,
            padding: 8,
            border: '1px dashed rgba(94,255,178,0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 10,
          }}
        >
          <span style={{ color: 'var(--text-lo)' }}>est · cost per turn</span>
          <span style={{ color: 'var(--mint)' }}>
            ~{tokenEstimate.toLocaleString('en-US')} tok · ${cost}
          </span>
        </div>
      </div>
      <VimBar mode="NORMAL" cmd=":w settings/agent" hint="esc · :w" />
    </TermPhone>
  );
}

function SafetyRow({
  label,
  on,
  color,
  onChange,
}: {
  label: string;
  on: boolean;
  color: 'mint' | 'rose';
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 10,
      }}
    >
      <span style={{ color: 'var(--text-mid)' }}>{label}</span>
      <Toggle on={on} color={color} onChange={onChange} />
    </div>
  );
}
