'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Horizontal swipe-to-go-back.
 *
 * A left- or right-going drag that travels past `THRESHOLD` pops the current
 * view via `router.back()`. No edge requirement and no on-screen affordance —
 * just the gesture. Drags that read as vertical are ignored so page scrolling
 * is never stolen, and `/` (the boot screen, nothing to pop) is skipped.
 *
 * Mounted once, globally, in the root layout.
 */

const THRESHOLD = 64;   // px of horizontal travel needed to commit the back
const SLOP = 10;        // px before we decide horizontal vs vertical intent

interface Drag {
  startX: number;
  startY: number;
  decided: boolean;     // committed to a horizontal swipe
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
      drag = {
        startX: e.clientX,
        startY: e.clientY,
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
        // vertical intent → not a back swipe, let scrolling happen
        if (Math.abs(dy) >= Math.abs(dx)) {
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
      const commit = drag.decided && Math.abs(dx) >= THRESHOLD;
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
