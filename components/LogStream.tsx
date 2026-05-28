import React from 'react';

export type LogTone = 'lo' | 'mid' | 'hi' | 'mint' | 'cyan' | 'rose' | 'violet' | 'amber';

export interface LogEntry {
  /** Optional timestamp prefix, e.g. `[09:41:00.142]`. */
  ts?: string;
  /** The command/log text. */
  text: string;
  /** Color tone for the text. */
  tone?: LogTone;
  /** Shell-prompt prefix, e.g. `$` or `→`. */
  prefix?: string;
  /** Color tone for the prefix. */
  prefixTone?: LogTone;
}

const TONE: Record<LogTone, string> = {
  lo:     'var(--text-lo)',
  mid:    'var(--text-mid)',
  hi:     'var(--text-hi)',
  mint:   'var(--mint)',
  cyan:   'var(--cyan)',
  rose:   'var(--rose)',
  violet: 'var(--violet)',
  amber:  'var(--amber)',
};

/** Shell-style log lines: `$ pnpm dev`, `→ localhost:5173`, `✓ tsc · 0 errors`. */
export function LogStream({ entries }: { entries: LogEntry[] }) {
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
      {entries.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
          {e.ts && <span style={{ color: 'var(--text-lo)' }}>{e.ts}</span>}
          {e.prefix && <span style={{ color: TONE[e.prefixTone ?? 'rose'] }}>{e.prefix}</span>}
          <span style={{ color: TONE[e.tone ?? 'mid'] }}>{e.text}</span>
        </div>
      ))}
    </div>
  );
}
