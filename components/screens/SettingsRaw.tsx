'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TermPhone } from '../TermPhone';
import { TermAppBar } from '../TermAppBar';
import { VimBar } from '../VimBar';
import { pickSettings, useSettings } from '@/lib/settings-store';
import { settingsToToml, tomlToSettings, ParseError } from '@/lib/lucidrc';

interface Token {
  t: string;
  c: 'plain' | 'section' | 'key' | 'string' | 'number' | 'bool' | 'comment' | 'punct';
}

const TOKEN_COLOR: Record<Token['c'], string> = {
  plain:   'var(--text-mid)',
  section: 'var(--rose)',
  key:     'var(--text-hi)',
  string:  'var(--cyan)',
  number:  'var(--mint)',
  bool:    'var(--violet)',
  comment: 'var(--text-lo)',
  punct:   'var(--text-lo)',
};

function tokenizeTomlLine(line: string): Token[] {
  const out: Token[] = [];

  // comment lines
  if (line.trim().startsWith('#')) {
    return [{ t: line, c: 'comment' }];
  }
  // section header
  const sec = line.match(/^(\s*)(\[[\w.-]+\])(.*)$/);
  if (sec) {
    if (sec[1]) out.push({ t: sec[1], c: 'plain' });
    out.push({ t: sec[2], c: 'section' });
    if (sec[3]) out.push({ t: sec[3], c: 'plain' });
    return out;
  }

  // key = value
  const kv = line.match(/^(\s*)([\w.]+)(\s*=\s*)(.*)$/);
  if (kv) {
    if (kv[1]) out.push({ t: kv[1], c: 'plain' });
    out.push({ t: kv[2], c: 'key' });
    out.push({ t: kv[3], c: 'punct' });
    const v = kv[4];
    // split trailing comment from value
    let value = v;
    let comment = '';
    let inStr = false;
    for (let i = 0; i < v.length; i++) {
      const ch = v[i];
      if (ch === '"' && v[i - 1] !== '\\') inStr = !inStr;
      if (!inStr && ch === '#') {
        value = v.slice(0, i);
        comment = v.slice(i);
        break;
      }
    }

    if (/^".*"\s*$/.test(value)) out.push({ t: value, c: 'string' });
    else if (value.trim() === 'true' || value.trim() === 'false') out.push({ t: value, c: 'bool' });
    else if (/^-?\d+(\.\d+)?\s*$/.test(value)) out.push({ t: value, c: 'number' });
    else if (value.trim() === '"""') out.push({ t: value, c: 'punct' });
    else out.push({ t: value, c: 'plain' });
    if (comment) out.push({ t: comment, c: 'comment' });
    return out;
  }

  // multi-line string body / fence
  if (line.trim() === '"""') return [{ t: line, c: 'punct' }];
  return [{ t: line, c: 'plain' }];
}

/**
 * 15 — raw `.lucidrc` editor.
 *
 * Transparent <textarea> stacked on top of a syntax-highlighted <pre> overlay.
 * The textarea is the source of truth for the *buffer*; the store is updated
 * only when the user submits (Cmd/Ctrl+Enter or `:w`).
 */
export function SettingsRaw() {
  const router = useRouter();
  const settings = useSettings();
  const live = useMemo(() => settingsToToml(pickSettings(settings)), [settings]);

  const [buffer, setBuffer] = useState<string>(live);
  const [error, setError] = useState<ParseError | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(Date.now());
  const [now, setNow] = useState(Date.now());
  const lastExternal = useRef(live);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // If the store changes externally (e.g. user toggled something on screen 14
  // in a split window) and the user has not modified the buffer beyond the
  // last sync, pull the new live value in.
  useEffect(() => {
    if (buffer === lastExternal.current) {
      setBuffer(live);
      lastExternal.current = live;
    } else {
      // mark divergence — the buffer is in user-edit mode
      lastExternal.current = live;
    }
  }, [live]); // eslint-disable-line react-hooks/exhaustive-deps

  // ticker so "saved Xms ago" stays fresh
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const save = () => {
    const r = tomlToSettings(buffer);
    if (r.ok && r.value) {
      settings.replace(r.value);
      lastExternal.current = settingsToToml(r.value);
      setBuffer(lastExternal.current);
      setError(null);
      setSavedAt(Date.now());
    } else {
      setError(r.error ?? { line: 0, message: 'unknown parse error' });
    }
  };

  // live error feedback (no save) so users see invalid TOML highlighted as they type
  useEffect(() => {
    const r = tomlToSettings(buffer);
    if (!r.ok) setError(r.error ?? null);
    else setError(null);
  }, [buffer]);

  // shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inField = (e.target as HTMLElement | null)?.tagName === 'TEXTAREA';
      if (e.key === 'Escape') {
        if (inField) (e.target as HTMLElement).blur();
        else router.push('/settings');
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        save();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buffer, router]);

  const lines = buffer.split('\n');
  const savedAgo = savedAt ? Math.max(0, now - savedAt) : 0;

  return (
    <TermPhone>
      <TermAppBar project="settings" branch="-" state="CONF" />
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
        {/* breadcrumb / status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 10,
            marginBottom: 6,
          }}
        >
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-hi)', fontWeight: 700 }}>~/.lucidrc</span>
            <span style={{ color: 'var(--text-lo)' }}>· readonly: false</span>
          </div>
          {error ? (
            <span style={{ color: 'var(--rose)', fontSize: 9.5 }}>
              ● err line {error.line}
            </span>
          ) : savedAt ? (
            <span style={{ color: 'var(--mint)', fontSize: 9.5 }}>
              ● saved {formatAgo(savedAgo)}
            </span>
          ) : null}
        </div>

        {/* editor — textarea overlaid on syntax pre */}
        <div
          style={{
            position: 'relative',
            border: `1px solid ${error ? 'rgba(255,138,180,0.5)' : 'rgba(255,255,255,0.08)'}`,
            background: 'rgba(0,0,0,0.55)',
            minHeight: 380,
          }}
        >
          {/* syntax overlay */}
          <pre
            aria-hidden
            style={{
              margin: 0,
              padding: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              lineHeight: '15px',
              whiteSpace: 'pre',
              pointerEvents: 'none',
              color: 'var(--text-mid)',
            }}
          >
            {lines.map((line, i) => (
              <div key={i}>
                {tokenizeTomlLine(line).map((tok, j) => (
                  <span key={j} style={{ color: TOKEN_COLOR[tok.c] }}>
                    {tok.t || '​'}
                  </span>
                ))}
                {line === '' && '​'}
              </div>
            ))}
          </pre>
          {/* transparent textarea on top */}
          <textarea
            ref={textareaRef}
            value={buffer}
            onChange={(e) => setBuffer(e.target.value)}
            spellCheck={false}
            wrap="off"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              padding: 8,
              margin: 0,
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              lineHeight: '15px',
              whiteSpace: 'pre',
              background: 'transparent',
              color: 'transparent',
              caretColor: 'var(--text-hi)',
              overflow: 'auto',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              marginTop: 6,
              padding: '4px 8px',
              border: '1px solid rgba(255,138,180,0.4)',
              background: 'rgba(255,138,180,0.06)',
              color: 'var(--rose)',
              fontSize: 9.5,
            }}
          >
            line {error.line}: {error.message}
          </div>
        )}

        <div
          style={{
            marginTop: 8,
            display: 'flex',
            justifyContent: 'space-between',
            color: 'var(--text-lo)',
            fontSize: 9.5,
          }}
        >
          <span>
            <span style={{ color: 'var(--cyan)' }}>:w</span> to save ·{' '}
            <span style={{ color: 'var(--rose)' }}>:q</span> to abandon
          </span>
          <button
            type="button"
            onClick={save}
            disabled={!!error}
            style={{
              appearance: 'none',
              padding: '2px 8px',
              border: `1px solid ${error ? 'rgba(255,255,255,0.15)' : 'var(--mint)'}`,
              background: 'transparent',
              color: error ? 'var(--text-lo)' : 'var(--mint)',
              fontFamily: 'var(--font-mono)',
              fontSize: 9.5,
              letterSpacing: 0.5,
              cursor: error ? 'default' : 'pointer',
            }}
          >
            [⌘↵] WRITE
          </button>
        </div>
      </div>
      <VimBar mode="INSERT" cmd=":w lucidrc" hint=":w · :q · esc" />
    </TermPhone>
  );
}

function formatAgo(ms: number): string {
  if (ms < 1000) return `${ms}ms ago`;
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`;
  return `${Math.floor(ms / 60_000)}m ago`;
}
