'use client';

import React from 'react';
import { BlockWave } from '../BlockWave';
import { useActiveSession } from '@/lib/store';

/**
 * Full-pane overlay shown while the user holds the mic.
 * Reads recElapsed + interim from the active session.
 */
export function ListeningOverlay() {
  const active = useActiveSession();
  const elapsed = active?.recElapsed ?? 0;
  const interim = active?.interim ?? '';
  const seconds = `${Math.floor(elapsed).toString().padStart(1, '0')}:${(Math.floor((elapsed * 10) % 600) / 10).toFixed(1).padStart(4, '0')}`;
  // detected entities — naive token classifier so the pills react to actual speech
  const pills = pillsFromInterim(interim);
  const transcript = interim || '…listening';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: '50px 16px 90px',
        fontFamily: 'var(--font-mono)',
        fontSize: 11.5,
        zIndex: 4,
        background:
          'linear-gradient(180deg, rgba(255,138,180,0.06) 0%, transparent 40%, transparent 100%)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <div
          style={{
            width: 8,
            height: 8,
            background: 'var(--rose)',
            boxShadow: '0 0 10px var(--rose)',
            animation: 'breathe 0.8s ease-in-out infinite',
          }}
        />
        <span style={{ color: 'var(--rose)', fontWeight: 700, letterSpacing: 1 }}>
          RECORDING
        </span>
        <span style={{ color: 'var(--text-lo)', marginLeft: 'auto' }}>{seconds}</span>
      </div>

      <div
        style={{
          color: 'var(--text-lo)',
          fontSize: 10,
          letterSpacing: 1,
          marginBottom: 6,
        }}
      >
        // TRANSCRIBING · whisper-v3 · 0.4s
      </div>

      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 22,
          lineHeight: 1.3,
          color: 'var(--text-hi)',
          padding: '10px 0',
          borderTop: '1px dashed rgba(255,255,255,0.1)',
          borderBottom: '1px dashed rgba(255,255,255,0.1)',
          minHeight: 92,
        }}
      >
        {interim ? `"${transcript}"` : (
          <span style={{ color: 'var(--text-lo)' }}>…listening</span>
        )}
        <span
          style={{
            display: 'inline-block',
            width: 2,
            height: 22,
            marginLeft: 4,
            background: 'var(--cyan)',
            verticalAlign: 'middle',
            animation: 'breathe 0.9s steps(2) infinite',
          }}
        />
      </div>

      <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4, minHeight: 22 }}>
        {pills.map((p, i) => (
          <span
            key={i}
            style={{
              padding: '1px 6px',
              fontSize: 9.5,
              color:
                p.tone === 'cyan' ? 'var(--cyan)'
                : p.tone === 'rose' ? 'var(--rose)'
                : 'var(--text-mid)',
              border: `1px solid ${
                p.tone === 'cyan' ? 'rgba(107,229,255,0.4)'
                : p.tone === 'rose' ? 'rgba(255,138,180,0.4)'
                : 'rgba(255,255,255,0.1)'
              }`,
            }}
          >
            {p.text}
          </span>
        ))}
      </div>

      <div
        style={{
          marginTop: 22,
          padding: 14,
          border: '1px solid rgba(255,138,180,0.3)',
          background: 'rgba(255,138,180,0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <BlockWave count={42} active color="var(--rose)" height={26} />
        </div>
        <div
          style={{
            textAlign: 'center',
            marginTop: 12,
            color: 'var(--text-mid)',
            fontSize: 10,
          }}
        >
          release to send · drag up to cancel
        </div>
      </div>
    </div>
  );
}

interface Pill { text: string; tone: 'cyan' | 'rose' | 'mid' }

function pillsFromInterim(text: string): Pill[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const out: Pill[] = [];
  const has = (w: string) => lower.includes(w);

  if (has('reflection')) out.push({ text: 'reflection', tone: 'cyan' });
  if (has('card'))       out.push({ text: 'card',       tone: 'cyan' });
  if (has('chime'))      out.push({ text: 'chime: soft', tone: 'rose' });
  if (has('moon'))       out.push({ text: 'moon.phase', tone: 'cyan' });
  if (has('corner'))     out.push({ text: 'corner',     tone: 'mid' });
  if (has('quiet'))      out.push({ text: 'quiet',      tone: 'mid' });
  if (has('night'))      out.push({ text: 'night',      tone: 'mid' });
  if (has('softer'))     out.push({ text: 'volume: soft', tone: 'rose' });
  return out.slice(0, 6);
}
