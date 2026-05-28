'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { IconChevL } from './icons';

/**
 * Android-style edge swipe-to-go-back.
 *
 * Native phones let you drag in from the left edge of the screen to pop the
 * current view. We replicate that: a touch that starts within `EDGE` px of the
 * left edge and drags right past `THRESHOLD` calls `router.back()`. A small
 * chevron pill follows the finger so the gesture feels tactile, and the whole
 * screen slides slightly to telegraph the pop.
 *
 * Mounted once, globally, in the root layout. It never fires on `/` (the boot
 * screen has nothing to pop back to) and bails the moment a drag reads as
 * vertical, so it never steals scrolls.
 */

const EDGE = 28;        // px from the left edge a drag must start within
const THRESHOLD = 88;   // px of horizontal travel needed to commit the back
const SLOP = 8;         // px before we decide horizontal vs vertical intent

interface Drag {
  startX: number;
  startY: number;
  decided: boolean;     // committed to a horizontal back gesture
  pointerId: number;
}

export function EdgeSwipeBack() {
  const router = useRouter();
  const pathname = usePathname();
  const [progress, setProgress] = useState(0); // 0..1 toward committing
  const drag = useRef<Drag | null>(null);

  const canBack = !!pathname && pathname !== '/';

  useEffect(() => {
    if (!canBack) return;

    const reset = () => {
      drag.current = null;
      setProgress(0);
    };

    const onDown = (e: PointerEvent) => {
      // start only from the left edge (offset by any OS safe-area inset)
      const safeLeft = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--safe-left'),
      ) || 0;
      if (e.clientX > safeLeft + EDGE) return;
      drag.current = {
        startX: e.clientX,
        startY: e.clientY,
        decided: false,
        pointerId: e.pointerId,
      };
    };

    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;

      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;

      if (!d.decided) {
        if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
        // vertical / leftward intent → not a back gesture, let it go
        if (Math.abs(dy) >= Math.abs(dx) || dx <= 0) {
          reset();
          return;
        }
        d.decided = true;
      }

      // we own this gesture now — stop scroll + the browser's own edge-back
      e.preventDefault();
      setProgress(Math.max(0, Math.min(1, dx / THRESHOLD)));
    };

    const onUp = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      const dx = e.clientX - d.startX;
      const commit = d.decided && dx >= THRESHOLD;
      reset();
      if (commit) router.back();
    };

    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [canBack, router]);

  if (!canBack || progress <= 0) return null;

  // chevron pill rides in from the edge; passes "ready" tint near commit
  const ready = progress >= 1;
  const x = -12 + progress * 26;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 96,
        zIndex: 200,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        // a faint vignette so the page reads as "peeling back"
        background: `linear-gradient(90deg, rgba(0,0,0,${0.28 * progress}), transparent)`,
      }}
    >
      <div
        style={{
          transform: `translateX(${x}px)`,
          width: 34,
          height: 34,
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(7,6,15,0.82)',
          border: `1px solid ${ready ? 'var(--rose)' : 'rgba(255,255,255,0.16)'}`,
          boxShadow: ready ? '0 0 18px rgba(255,138,180,0.45)' : 'none',
          opacity: 0.35 + progress * 0.65,
          transition: 'border-color 0.1s, box-shadow 0.1s',
        }}
      >
        <IconChevL size={16} stroke={ready ? 'var(--rose)' : 'var(--text-mid)'} sw={2} />
      </div>
    </div>
  );
}
