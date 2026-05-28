'use client';

import { useEffect, useState } from 'react';

/**
 * Pixel offset that a fixed-bottom UI element should be lifted by to stay
 * above the on-screen keyboard.
 *
 * Computed from `window.visualViewport`: when the keyboard opens, the layout
 * viewport stays the same but the visual viewport shrinks. The delta is the
 * keyboard height (plus any vertical scroll the browser applies to keep the
 * focused field in view).
 *
 *   layoutBottom    = window.innerHeight
 *   visualBottom    = visualViewport.height + visualViewport.offsetTop
 *   keyboardOffset  = layoutBottom - visualBottom
 *
 * Returns 0 when no keyboard is up, or on browsers without `visualViewport`.
 */
export function useViewportBottom(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const diff = window.innerHeight - vv.height - vv.offsetTop;
      setOffset(Math.max(0, Math.round(diff)));
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return offset;
}
