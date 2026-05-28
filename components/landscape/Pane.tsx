import React from 'react';
import { Tone, toneColor } from '@/lib/types';

interface PaneProps {
  title: string;
  /** Optional small badge to the right of the title (e.g. `2/5`, `live`). */
  badge?: React.ReactNode;
  /** Accent color for the title; defaults to muted. */
  tone?: Tone | 'muted';
  /** Body content. Renders inside a scrolling area. */
  children: React.ReactNode;
  /** Optional footer hint row. */
  footer?: React.ReactNode;
  /** Skip default body padding — useful for content that paints edge-to-edge. */
  noPad?: boolean;
}

/**
 * One column inside a `<PaneSplit>`. tmux-style: dashed header with
 * `TITLE [BADGE]`, scrolling body, optional dashed footer.
 *
 * Doesn't own its width — that comes from the parent `<PaneSplit>`. Doesn't
 * own scroll position — that comes from the body div.
 */
export function Pane({ title, badge, tone = 'muted', children, footer, noPad = false }: PaneProps) {
  const titleColor =
    tone === 'muted' ? 'rgba(255,255,255,0.4)' : toneColor(tone as Tone);

  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div
        style={{
          padding: '6px 10px',
          borderBottom: '1px dashed rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 10,
          letterSpacing: 0.8,
          background: 'rgba(0,0,0,0.3)',
          color: 'var(--text-lo)',
          flexShrink: 0,
        }}
      >
        <span style={{ color: titleColor, fontWeight: 700 }}>{title}</span>
        {badge != null && (
          <span style={{ color: 'var(--text-mid)' }}>{badge}</span>
        )}
      </div>
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          padding: noPad ? 0 : '8px 10px',
          fontSize: 10.5,
          color: 'var(--text-hi)',
        }}
      >
        {children}
      </div>
      {footer != null && (
        <div
          style={{
            padding: '4px 10px',
            borderTop: '1px dashed rgba(255,255,255,0.08)',
            fontSize: 9.5,
            color: 'var(--text-lo)',
            background: 'rgba(0,0,0,0.3)',
            flexShrink: 0,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
