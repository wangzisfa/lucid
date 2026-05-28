'use client';

import React from 'react';
import { useActiveSession } from '@/lib/store';
import { BlockWave } from '../BlockWave';

/**
 * 10 — listening hero. When `state === 'REC'` the 3-pane layout cedes the
 * whole canvas to the live transcript. Header + italic transcript + token
 * pills + edge-to-edge BlockWave with the HOLD pill at the right.
 *
 * The HOLD pill itself is rendered by `LandBottomBar`'s `<HoldMic>`; this
 * view only owns the visual hero state above the bottom strip.
 */
export function LandListeningHero() {
  const active = useActiveSession();
  const elapsed = active?.recElapsed ?? 0;
  const interim = active?.interim ?? '';
  const seconds = formatElapsed(elapsed);
  const pills = pillsFromInterim(interim);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* mini header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px 6px',
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          borderBottom: '1px dashed rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
          <span style={{ color: 'var(--text-lo)' }}>{seconds} · whisper-v3</span>
        </div>
        <span style={{ color: 'var(--text-lo)' }}>release to send · drag up to cancel</span>
      </div>

      {/* hero transcript */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          padding: '20px 24px',
          position: 'relative',
        }}
      >
        <div
          style={{
            color: 'var(--text-lo)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: 1,
            marginBottom: 14,
          }}
        >
          // LIVE TRANSCRIPT
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 30,
            lineHeight: 1.2,
            color: 'var(--text-hi)',
            maxWidth: 460,
          }}
        >
          {interim ? `"${interim}"` : <span style={{ color: 'var(--text-lo)' }}>…listening</span>}
          <span
            style={{
              display: 'inline-block',
              width: 3,
              height: 28,
              marginLeft: 4,
              background: 'var(--cyan)',
              verticalAlign: 'middle',
              animation: 'breathe 0.9s steps(2) infinite',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 5,
            marginTop: 18,
            fontFamily: 'var(--font-mono)',
            minHeight: 22,
          }}
        >
          {pills.map((p, i) => (
            <span
              key={i}
              style={{
                padding: '2px 7px',
                fontSize: 10.5,
                color:
                  p.tone === 'cyan' ? 'var(--cyan)'
                  : p.tone === 'rose' ? 'var(--rose)'
                  : p.tone === 'mint' ? 'var(--mint)'
                  : 'var(--text-mid)',
                border: `1px solid ${
                  p.tone === 'cyan' ? 'rgba(107,229,255,0.4)'
                  : p.tone === 'rose' ? 'rgba(255,138,180,0.4)'
                  : p.tone === 'mint' ? 'rgba(94,255,178,0.4)'
                  : 'rgba(255,255,255,0.1)'
                }`,
              }}
            >
              {p.text}
            </span>
          ))}
        </div>
      </div>

      {/* edge-to-edge waveform strip */}
      <div
        style={{
          padding: '10px 20px',
          borderTop: '1px solid rgba(255,138,180,0.3)',
          background: 'rgba(255,138,180,0.04)',
          flexShrink: 0,
        }}
      >
        <BlockWave count={80} active color="var(--rose)" height={20} />
      </div>
    </div>
  );
}

interface Pill { text: string; tone: 'cyan' | 'rose' | 'mint' | 'mid' }

function pillsFromInterim(text: string): Pill[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const has = (w: string) => lower.includes(w);
  const out: Pill[] = [];
  if (has('reflection')) out.push({ text: 'reflection', tone: 'cyan' });
  if (has('card'))       out.push({ text: 'card',       tone: 'cyan' });
  if (has('chime'))      out.push({ text: 'chime: soft', tone: 'rose' });
  if (has('moon'))       out.push({ text: 'moon.phase', tone: 'cyan' });
  if (has('corner'))     out.push({ text: 'corner',     tone: 'mid' });
  if (has('quiet'))      out.push({ text: 'quiet',      tone: 'mid' });
  if (has('night'))      out.push({ text: 'night',      tone: 'mid' });
  if (has('softer'))     out.push({ text: 'volume: soft', tone: 'rose' });
  if (text.length > 12)  out.push({ text: '→ 3 files',  tone: 'mint' });
  return out.slice(0, 6);
}

function formatElapsed(seconds: number): string {
  const tenths = Math.floor(seconds * 10);
  const whole = Math.floor(tenths / 10);
  const frac = tenths % 10;
  return `${whole}:${String(frac).padStart(2, '0')}`;
}
