'use client';

import { useEffect, useState } from 'react';

/**
 * `true` when the layout viewport is narrow enough that we should drop the
 * decorative phone frame and go full-bleed. SSR-safe (returns false on the
 * server; updates after mount).
 */
export function useIsMobile(breakpoint = 480): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, [breakpoint]);

  return isMobile;
}
