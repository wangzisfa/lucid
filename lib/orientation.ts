'use client';

import { useEffect, useState } from 'react';

export type Orientation = 'portrait' | 'landscape';

/**
 * SSR-safe orientation observable. Returns `'portrait'` until mounted, then
 * tracks `matchMedia('(orientation: landscape)')` for the lifetime of the
 * component.
 *
 * Reacts to:
 *   - real device rotation (`change` event on the MediaQueryList)
 *   - browser window resize across the aspect ratio (same event)
 *
 * Use this from any screen that needs to swap layouts. Don't write to it;
 * it's read-only.
 */
export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>('portrait');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(orientation: landscape)');
    const update = () => setOrientation(mq.matches ? 'landscape' : 'portrait');
    update();

    // Modern API; old Safari (≤13) needs the legacy addListener path.
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  return orientation;
}
