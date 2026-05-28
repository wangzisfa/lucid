'use client';

import { useState } from 'react';

/**
 * The "live preview" target loaded inside the run view's iframe.
 * Visually echoes the reflection-card mock the agent just built.
 */
export default function ReflectionCardPreview() {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const save = () => {
    if (!text.trim()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a1a',
        padding: 18,
        display: 'flex',
      }}
    >
      <div
        style={{
          flex: 1,
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: 'linear-gradient(180deg, #14111e, #0a0a1a)',
          border: '1px solid rgba(255,138,180,0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-lo)',
          }}
        >
          <span>idea-garden</span>
          <span style={{ color: 'var(--cyan)' }}>◐ waxing</span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 28,
            color: 'var(--text-hi)',
            lineHeight: 1.15,
            margin: '16px 0 4px',
          }}
        >
          What stayed<br />with you today?
        </div>
        <div
          style={{
            height: 1,
            background: 'rgba(255,138,180,0.5)',
            boxShadow: '0 0 8px var(--rose)',
          }}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="i finally finished that…"
          style={{
            flex: 1,
            minHeight: 120,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-hi)',
            padding: 10,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            resize: 'none',
            outline: 'none',
          }}
        />
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 4,
          }}
        >
          <span
            style={{
              color: 'var(--text-lo)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
            }}
          >
            9:00pm · chime · pong.wav
          </span>
          <button
            type="button"
            onClick={save}
            disabled={!text.trim()}
            style={{
              padding: '6px 14px',
              background: text.trim() ? 'var(--rose)' : 'rgba(255,255,255,0.08)',
              color: text.trim() ? '#000' : 'var(--text-lo)',
              fontWeight: 700,
              letterSpacing: 0.6,
              border: 'none',
              cursor: text.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
          >
            {saved ? 'SAVED ✓' : 'SAVE'}
          </button>
        </div>
      </div>
    </div>
  );
}
