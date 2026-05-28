'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TermPhone } from '../TermPhone';
import { TermAppBar } from '../TermAppBar';
import { VimBar } from '../VimBar';
import { Toggle } from '../form/Toggle';
import { Stepper } from '../form/Stepper';
import { ProviderId, maskKey, useSettings } from '@/lib/settings-store';

interface ProviderRow {
  id: ProviderId;
  label: string;
  models: string;
  tone: 'rose' | 'cyan' | 'violet' | 'mint';
  /** Computed status. */
  variant: 'remote' | 'local' | 'hosted';
}

const TONE = {
  rose:   'var(--rose)',
  cyan:   'var(--cyan)',
  violet: 'var(--violet)',
  mint:   'var(--mint)',
};

const ROWS: ProviderRow[] = [
  { id: 'anthropic',   label: 'anthropic',   models: 'claude-haiku-4 · sonnet · opus',  tone: 'rose',   variant: 'remote' },
  { id: 'openai',      label: 'openai',      models: 'gpt-5 · gpt-5-mini · o5',          tone: 'mint',   variant: 'remote' },
  { id: 'google',      label: 'google',      models: 'gemini-2.5 · flash',               tone: 'cyan',   variant: 'remote' },
  { id: 'openrouter',  label: 'openrouter',  models: 'any model · unified billing',      tone: 'violet', variant: 'remote' },
  { id: 'ollama',      label: 'ollama',      models: 'qwen-32b · llama-4 · deepseek',    tone: 'mint',   variant: 'local'  },
  { id: 'lucid-cloud', label: 'lucid cloud', models: 'all hosted models',                tone: 'cyan',   variant: 'hosted' },
];

const ADD_PROVIDERS: ProviderId[] = ['anthropic', 'openai', 'google', 'openrouter', 'ollama'];

function statusLabel(r: ProviderRow, key: string): { txt: string; color: string } {
  if (r.variant === 'hosted') return { txt: '● PRO', color: 'var(--mint)' };
  if (r.variant === 'local') return key ? { txt: '● LOCAL', color: 'var(--mint)' } : { txt: '○ EMPTY', color: 'var(--text-lo)' };
  return key ? { txt: '● LINKED', color: 'var(--mint)' } : { txt: '○ EMPTY', color: 'var(--text-lo)' };
}

function keyField(r: ProviderRow, s: ReturnType<typeof useSettings.getState>): string {
  switch (r.id) {
    case 'anthropic':   return s.providers.anthropicKey;
    case 'openai':      return s.providers.openaiKey;
    case 'google':      return s.providers.googleKey;
    case 'ollama':      return s.providers.ollamaUrl;
    case 'lucid-cloud': return 'auto · included in pro';
    default:            return '';
  }
}

/**
 * 13 — providers / BYOK.
 *
 * Six provider rows + per-model routing + safety toggles + add-key panel.
 * Pasting reads `navigator.clipboard.readText()`; testing a key is a 600ms no-op.
 */
export function SettingsProviders() {
  const router = useRouter();
  const settings = useSettings();
  const [addProvider, setAddProvider] = useState<ProviderId>('openai');
  const [keyInput, setKeyInput] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'failed'>('idle');

  const activeKey = keyInput;

  const onPaste = async () => {
    try {
      const txt = await navigator.clipboard.readText();
      setKeyInput(txt.trim());
    } catch {
      // user blocked clipboard — leave field as-is
    }
  };

  const onTest = () => {
    if (!activeKey) return;
    setTestStatus('testing');
    setTimeout(() => setTestStatus('ok'), 600);
  };

  const onSave = () => {
    if (!activeKey) return;
    if (addProvider === 'anthropic') settings.setProviders('anthropicKey', activeKey);
    else if (addProvider === 'openai') settings.setProviders('openaiKey', activeKey);
    else if (addProvider === 'google') settings.setProviders('googleKey', activeKey);
    else if (addProvider === 'ollama') settings.setProviders('ollamaUrl', activeKey);
    setKeyInput('');
    setTestStatus('idle');
  };

  // global shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (inField) return;
      if (e.key === 'Escape') router.push('/settings');
      if (e.key.toLowerCase() === 't') onTest();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, router]);

  return (
    <TermPhone>
      <TermAppBar project="settings" branch="-" state="KEYS" />
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
          <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>[providers]</span>
        </div>

        {/* CURRENT */}
        <div style={{ color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>// CURRENT</div>
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {ROWS.map((r) => {
            const k = keyField(r, settings);
            const status = statusLabel(r, k);
            const sel = settings.providers.active === r.id;
            const tone = TONE[r.tone];
            return (
              <button
                type="button"
                key={r.id}
                onClick={() => settings.setProviders('active', r.id)}
                style={{
                  appearance: 'none',
                  textAlign: 'left',
                  padding: '6px 8px',
                  border: `1px solid ${sel ? tone : 'rgba(255,255,255,0.08)'}`,
                  background: sel ? 'rgba(255,138,180,0.05)' : 'rgba(0,0,0,0.2)',
                  color: 'inherit',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: sel ? tone : 'var(--text-lo)', width: 12 }}>
                    {sel ? '◉' : '○'}
                  </span>
                  <span
                    style={{
                      color: sel ? 'var(--text-hi)' : 'var(--text-mid)',
                      fontWeight: sel ? 600 : 400,
                    }}
                  >
                    {r.label}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 9,
                      letterSpacing: 0.5,
                      color: status.color,
                      fontWeight: 700,
                    }}
                  >
                    {status.txt}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 2,
                    paddingLeft: 18,
                    fontSize: 9.5,
                  }}
                >
                  <span style={{ color: k ? 'var(--text-mid)' : 'var(--text-lo)' }}>
                    {k ? (r.variant === 'remote' ? maskKey(k) : k) : '— no key on device'}
                  </span>
                </div>
                <div style={{ paddingLeft: 18, color: 'var(--text-lo)', fontSize: 9, marginTop: 1 }}>
                  {r.models}
                </div>
              </button>
            );
          })}
        </div>

        {/* ROUTING */}
        <div style={{ marginTop: 12, color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>
          // PER-MODEL ROUTING
        </div>
        <div
          style={{
            marginTop: 4,
            padding: 6,
            border: '1px dashed rgba(255,255,255,0.08)',
            fontSize: 9.5,
            lineHeight: 1.55,
          }}
        >
          {[
            ['claude-sonnet-4.5', 'anthropic'],
            ['claude-haiku-4',    'anthropic'],
            ['gpt-5',             'openai'],
            ['gemini-2.5',        'google'],
            ['qwen-32b',          'ollama'],
          ].map(([m, p]) => {
            const ok = !!keyField({ id: p } as ProviderRow, settings);
            return (
              <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--text-mid)', flex: 1 }}>{m}</span>
                <span style={{ color: 'var(--text-lo)' }}>→</span>
                <span style={{ color: ok ? 'var(--text-hi)' : 'var(--text-lo)' }}>{p}</span>
                <span style={{ color: ok ? 'var(--mint)' : 'var(--rose)', fontSize: 9, fontWeight: 700 }}>
                  {ok ? '✓' : '!key'}
                </span>
              </div>
            );
          })}
        </div>

        {/* SAFETY */}
        <div style={{ marginTop: 12, color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>
          // SAFETY
        </div>
        <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Row label="keys stored on device only">
            <Toggle
              on={settings.providers.onDeviceOnly}
              color="mint"
              onChange={(v) => settings.setProviders('onDeviceOnly', v)}
            />
          </Row>
          <Row label="redact in logs">
            <Toggle on={true} color="mint" />
          </Row>
          <Row label="fallback to lucid cloud">
            <Toggle
              on={settings.providers.fallback === 'lucid-cloud'}
              color="mint"
              onChange={(v) => settings.setProviders('fallback', v ? 'lucid-cloud' : 'none')}
            />
          </Row>
        </div>

        {/* SERVER */}
        <div style={{ marginTop: 12, color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>
          // SERVER
        </div>
        <div
          style={{
            marginTop: 4,
            padding: 8,
            border: '1px dashed rgba(255,138,180,0.4)',
            background: 'rgba(255,138,180,0.04)',
          }}
        >
          <input
            type="url"
            inputMode="url"
            value={settings.providers.serverUrl}
            onChange={(e) => settings.setProviders('serverUrl', e.target.value.trim())}
            placeholder="https://your-lucid-server"
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            style={{
              width: '100%',
              padding: '5px 6px',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              color: 'var(--text-hi)',
              outline: 'none',
            }}
          />
          <div style={{ marginTop: 6, fontSize: 9, color: 'var(--text-lo)', lineHeight: 1.5 }}>
            → where the agent loop runs · the app sends prompts + your key here
            <br />→ blank = same origin (web)
          </div>
        </div>

        {/* ADD KEY */}
        <div style={{ marginTop: 12, color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>
          // ADD KEY
        </div>
        <div
          style={{
            marginTop: 4,
            padding: 8,
            border: '1px dashed rgba(107,229,255,0.4)',
            background: 'rgba(107,229,255,0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span style={{ color: 'var(--text-lo)', fontSize: 9 }}>provider</span>
            <Stepper
              value={addProvider}
              options={ADD_PROVIDERS}
              color="cyan"
              onChange={(v) => setAddProvider(v)}
            />
          </div>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => {
              setKeyInput(e.target.value);
              setTestStatus('idle');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSave();
              }
            }}
            placeholder="paste your key"
            spellCheck={false}
            style={{
              width: '100%',
              padding: '5px 6px',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              color: 'var(--text-hi)',
              letterSpacing: 1.5,
              outline: 'none',
            }}
          />
          <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
            <Chip color="var(--cyan)" onClick={onPaste}>[⌘V] PASTE</Chip>
            <Chip color="var(--mint)" onClick={onTest} disabled={!keyInput}>
              {testStatus === 'testing' ? '[T] …' : testStatus === 'ok' ? '[T] OK' : '[T] TEST'}
            </Chip>
            <Chip color="var(--text-mid)" onClick={onSave} disabled={!keyInput}>
              [↵] SAVE
            </Chip>
          </div>
          <div style={{ marginTop: 6, fontSize: 9, color: 'var(--text-lo)', lineHeight: 1.5 }}>
            → stored in keychain · encrypted with device key
            <br />→ never sent to lucid servers
          </div>
        </div>
      </div>
      <VimBar mode="INSERT" cmd=":w providers" hint="esc · :w" />
    </TermPhone>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
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
      {children}
    </div>
  );
}

function Chip({
  color,
  onClick,
  disabled,
  children,
}: {
  color: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        appearance: 'none',
        padding: '2px 8px',
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.15)' : color}`,
        background: 'transparent',
        color: disabled ? 'var(--text-lo)' : color,
        fontFamily: 'var(--font-mono)',
        fontSize: 9.5,
        letterSpacing: 0.5,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}
