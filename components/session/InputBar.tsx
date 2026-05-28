'use client';

import React, { useState } from 'react';
import { useActiveSession, useSessions } from '@/lib/store';
import { useViewportBottom } from '@/lib/useViewportBottom';
import { HoldMic } from '../HoldMic';

/**
 * Bottom input bar: text field + canonical `<HoldMic>`.
 *
 * Operates against the active session — `submitTextTurn` lands on
 * `useSessions.activeId`. If somehow there's no active session this
 * silently drops the submit (the screen itself will have already
 * redirected before this renders, in practice).
 *
 * Two pieces of mobile housekeeping:
 *   - **Keyboard-aware position.** `useViewportBottom()` returns the
 *     `visualViewport`-derived offset; we lift the bar by that many px so
 *     the soft keyboard doesn't cover it.
 *   - **`fontSize: 16`** on the input prevents iOS Safari from auto-zooming
 *     on focus (anything < 16 triggers the zoom).
 */
export function InputBar() {
  const active = useActiveSession();
  const submitText = useSessions((s) => s.submitTextTurn);
  const kbOffset = useViewportBottom();
  const [text, setText] = useState('');

  const state = active?.state ?? 'IDLE';
  const elapsed = active?.recElapsed ?? 0;

  const recording = state === 'REC';
  const placeholder =
    recording ? `listening… ${elapsed.toFixed(1)}s`
    : state === 'STT' ? 'transcribing…'
    : 'type or hold ▮';

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    submitText(active.id, text);
    setText('');
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        position: 'absolute',
        bottom: 50 + kbOffset,
        left: 12,
        right: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        zIndex: 5,
        transition: 'bottom 120ms ease',
      }}
    >
      <label
        style={{
          flex: 1,
          height: 36,
          border: `1px solid ${recording ? 'var(--rose)' : 'rgba(255,255,255,0.1)'}`,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-hi)',
          gap: 8,
          transition: 'border-color 120ms',
        }}
      >
        <span style={{ color: 'var(--rose)', fontSize: 11 }}>›</span>
        <input
          type="text"
          inputMode="text"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={recording || state === 'STT'}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-hi)',
            fontFamily: 'inherit',
            // 16px prevents iOS auto-zoom on focus
            fontSize: 16,
            outline: 'none',
            padding: 0,
          }}
        />
      </label>

      <HoldMic />
    </form>
  );
}
