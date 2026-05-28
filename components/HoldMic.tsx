'use client';

import React from 'react';
import { IconMic, IconStop } from './icons';
import { useVoice } from '@/lib/useVoice';
import { useActiveSession } from '@/lib/store';

interface HoldMicProps {
  /** Square button size in px. */
  size?: number;
  /** Optional aria-label override. */
  label?: string;
}

/**
 * Canonical hold-to-record mic button. Drives the session store via
 * `useVoice()` — there is exactly one mic implementation in the app and this
 * is it.
 *
 * Pointer events: `pointerdown` starts capture; **all three of**
 * `pointerup`, `pointerleave`, and `pointercancel` are wired to `stop()`. The
 * cancel handler matters on touch — when the OS hijacks the gesture (system
 * notification, alert, navigation pop, swipe-back), we still want the
 * recording to finalize rather than dangle.
 *
 * `touch-action: none` prevents the browser from interpreting the press as a
 * pan/scroll/zoom while we're owning the gesture.
 */
export function HoldMic({ size = 36, label = 'hold to record' }: HoldMicProps) {
  const voice = useVoice();
  const active = useActiveSession();
  const recording = active?.state === 'REC';

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={recording}
      onPointerDown={voice.start}
      onPointerUp={voice.stop}
      onPointerLeave={voice.stop}
      onPointerCancel={voice.stop}
      onContextMenu={(e) => e.preventDefault()}
      className="no-select"
      style={{
        width: size,
        height: size,
        background: recording ? '#fff' : 'var(--rose)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        boxShadow: recording
          ? '0 0 28px var(--rose), 0 0 60px rgba(255,138,180,0.4)'
          : '0 0 12px rgba(255,138,180,0.4)',
        touchAction: 'none',
        transform: recording ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease',
      }}
    >
      {recording
        ? <IconStop size={size * 0.4} stroke="var(--rose)" fill="var(--rose)" sw={2} />
        : <IconMic  size={size * 0.45} stroke="#000" sw={2.4} />
      }
    </button>
  );
}
