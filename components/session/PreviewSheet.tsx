'use client';

import React from 'react';
import { IconClose } from '../icons';

interface Props {
  onClose: () => void;
}

/**
 * Slide-up modal sheet showing the agent's live preview inside an iframe.
 * Loaded by tapping the `[P] preview` chip in the session header once a turn
 * has reached LIVE. Matches the spirit of `05-run.png` — frame, preview crate,
 * HMR badge.
 */
export function PreviewSheet({ onClose }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 7,
        background: 'rgba(7, 6, 15, 0.92)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'term-fade 0.18s ease-out',
      }}
    >
      {/* header */}
      <div
        style={{
          padding: '46px 14px 6px',
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--text-mid)',
          borderBottom: '1px dashed rgba(255,255,255,0.08)',
        }}
      >
        <span style={{ color: 'var(--mint)' }}>● localhost:5173</span>
        <span style={{ color: 'var(--text-lo)' }}>HMR · 142ms</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="close preview"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-mid)',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <IconClose size={14} />
        </button>
      </div>

      {/* tabs */}
      <div
        style={{
          display: 'flex',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: 0.6,
        }}
      >
        {(['CODE', 'PREVIEW', 'SHELL'] as const).map((t) => {
          const sel = t === 'PREVIEW';
          return (
            <div
              key={t}
              style={{
                padding: '4px 10px',
                color: sel ? 'var(--text-hi)' : 'var(--text-lo)',
                fontWeight: sel ? 700 : 400,
                borderBottom: sel
                  ? '1.5px solid var(--rose)'
                  : '1.5px solid rgba(255,255,255,0.06)',
              }}
            >
              {t}
            </div>
          );
        })}
        <div style={{ flex: 1, borderBottom: '1.5px solid rgba(255,255,255,0.06)' }} />
      </div>

      {/* preview frame */}
      <div
        style={{
          flex: 1,
          margin: 14,
          marginTop: 10,
          border: '1px solid rgba(255,138,180,0.3)',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '4px 8px',
            fontSize: 9.5,
            color: 'var(--text-lo)',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>┌── reflection-card ──┐</span>
          <span>9:00pm</span>
        </div>
        <iframe
          src="/preview/reflection-card"
          title="reflection card live preview"
          style={{
            flex: 1,
            border: 'none',
            background: '#0a0a1a',
            colorScheme: 'dark',
          }}
        />
        <div
          style={{
            padding: '4px 8px',
            fontSize: 9.5,
            color: 'var(--text-lo)',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>└──────────────────────┘</span>
          <span>chime · pong.wav</span>
        </div>
      </div>
    </div>
  );
}
