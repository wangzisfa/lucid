'use client';

import React, { useEffect, useRef, useState } from 'react';

interface PaneSplitProps {
  /** One child per pane. */
  children: React.ReactNode;
  /** Initial widths in percent, must sum to 100 and match `children.length`. */
  initialWidths: number[];
  /** Min width per pane in percent. */
  min?: number;
  /** Tone for the divider's center bar. */
  dividerColor?: string;
}

/**
 * tmux-style resizable split: N panes separated by draggable dividers.
 *
 * Drag math (lifted from `D_Live_Land` in `variation-d-live.jsx`): when the
 * divider between panes `i` and `i+1` moves by `dx` pixels, convert to a
 * percent of the container width and apply `+dx` to pane `i`, `-dx` to
 * pane `i+1`. If either pane would shrink below `min`, transfer the
 * overshoot to the other side.
 *
 * Pointer events only. `touch-action: none` on dividers so touch drags
 * don't scroll the page. Press `Escape` to reset widths to `initialWidths`.
 */
export function PaneSplit({
  children,
  initialWidths,
  min = 15,
  dividerColor = 'rgba(255,138,180,0.6)',
}: PaneSplitProps) {
  const panes = React.Children.toArray(children);
  const [widths, setWidths] = useState<number[]>(initialWidths);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset to initial if children count changes.
  useEffect(() => {
    if (widths.length !== panes.length) {
      setWidths(initialWidths);
    }
  }, [panes.length, initialWidths, widths.length]);

  // Esc → reset
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setWidths(initialWidths);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [initialWidths]);

  const startDrag = (idx: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const startX = e.clientX;
    const startWidths = [...widths];

    const onMove = (ev: PointerEvent) => {
      const dx = ((ev.clientX - startX) / rect.width) * 100;
      let a = startWidths[idx] + dx;
      let b = startWidths[idx + 1] - dx;
      if (a < min) {
        b -= (min - a);
        a = min;
      }
      if (b < min) {
        a -= (min - b);
        b = min;
      }
      const next = [...startWidths];
      next[idx] = a;
      next[idx + 1] = b;
      setWidths(next);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      {panes.map((pane, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              width: `${widths[i] ?? initialWidths[i] ?? 100 / panes.length}%`,
              height: '100%',
              minWidth: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {pane}
          </div>
          {i < panes.length - 1 && <Divider onDown={startDrag(i)} color={dividerColor} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function Divider({ onDown, color }: { onDown: (e: React.PointerEvent) => void; color: string }) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      onPointerDown={onDown}
      className="no-select"
      style={{
        width: 6,
        height: '100%',
        cursor: 'col-resize',
        flexShrink: 0,
        position: 'relative',
        background: 'rgba(255,255,255,0.04)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        touchAction: 'none',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 2,
          height: 22,
          background: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
    </div>
  );
}
