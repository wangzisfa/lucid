'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Android-style edge-swipe back navigation.
 *
 * Mirrors Android 10+ gesture navigation: an inward swipe that *starts at the
 * left or right screen edge* pops the current view via `router.back()`.
 *   - start within EDGE px of the left edge  → drag right → back
 *   - start within EDGE px of the right edge → drag left  → back
 *
 * Swipes that begin in the middle of the screen are app content, not a back
 * gesture, and are ignored — as are drags that read as vertical, so scrolling
 * is never stolen. `/` (the boot screen, nothing to pop) is skipped.
 *
 * Mounted once, globally, in the root layout. No on-screen affordance.
 */

const EDGE = 24;        // px from a screen edge a back swipe must start within
const THRESHOLD = 64;   // px of inward travel needed to commit the back
const SLOP = 10;        // px before we decide horizontal vs vertical intent

interface Drag {
  startX: number;
  startY: number;
  from: 'left' | 'right';
  decided: boolean;
  pointerId: number;
}

export function SwipeBack() {
  const router = useRouter();
  const pathname = usePathname();
  const canBack = !!pathname && pathname !== '/';

  useEffect(() => {
    if (!canBack) return;

    let drag: Drag | null = null;

    const onDown = (e: PointerEvent) => {
      const w = window.innerWidth;
      let from: 'left' | 'right' | null = null;
      if (e.clientX <= EDGE) from = 'left';
      else if (e.clientX >= w - EDGE) from = 'right';
      if (!from) return;
      drag = {
        startX: e.clientX,
        startY: e.clientY,
        from,
        decided: false,
        pointerId: e.pointerId,
      };
    };

    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (!drag.decided) {
        if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
        // must be horizontal AND headed inward from the edge it started on
        const inward = drag.from === 'left' ? dx > 0 : dx < 0;
        if (Math.abs(dy) >= Math.abs(dx) || !inward) {
          drag = null;
          return;
        }
        drag.decided = true;
      }
      // we own this gesture now — stop scroll + the browser's own edge-back
      e.preventDefault();
    };

    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      const dx = e.clientX - drag.startX;
      const inwardTravel = drag.from === 'left' ? dx : -dx;
      const commit = drag.decided && inwardTravel >= THRESHOLD;
      drag = null;
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

  return null;
}
