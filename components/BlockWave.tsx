'use client';

import React, { useEffect, useState } from 'react';

interface BlockWaveProps {
  count?: number;
  active?: boolean;
  color?: string;
  height?: number;
  /** Static fallback variant (server-renderable). */
  static_?: boolean;
}

const BLOCKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

/**
 * The voice waveform built from `▁▂▃▄▅▆▇█` block characters.
 *
 * Two modes:
 *   - active=false → deterministic static silhouette (good for SSR + voice replay)
 *   - active=true  → rAF-driven sine field, redraws each frame
 */
export function BlockWave({ count = 28, active = true, color = 'var(--violet)', height = 24 }: BlockWaveProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf: number;
    const loop = () => {
      setTick(performance.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const bars = Array.from({ length: count }).map((_, i) => {
    const t = active ? tick / 200 + i * 0.6 : i * 0.7;
    const v = active
      ? 0.5 + 0.5 * Math.sin(t) * Math.cos(t * 0.7 + i * 0.3) + 0.3 * Math.sin(t * 2.3 + i)
      : 0.2 + Math.abs(Math.sin((i + 1) * 0.7)) * 0.75;
    const idx = Math.max(0, Math.min(BLOCKS.length - 1, Math.floor(Math.abs(v) * BLOCKS.length)));
    return (
      <span
        key={i}
        style={{
          opacity: active ? 0.6 + Math.abs(v) * 0.4 : 0.25 + Math.abs(v) * 0.3,
        }}
      >
        {BLOCKS[idx]}
      </span>
    );
  });

  return (
    <div
      style={{
        display: 'flex',
        gap: 1,
        alignItems: 'flex-end',
        height,
        fontFamily: 'var(--font-mono)',
        color,
        fontSize: height * 0.85,
        lineHeight: 0.5,
        letterSpacing: -1,
        userSelect: 'none',
      }}
    >
      {bars}
    </div>
  );
}
