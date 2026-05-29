import { useWindowDimensions } from 'react-native';

export type Orientation = 'portrait' | 'landscape';

/**
 * Orientation observable — the RN translation of the web `useOrientation`.
 * Derives from `useWindowDimensions()` (which already re-renders on rotation
 * and split-screen resize), so screens can swap layouts reactively. Read-only.
 */
export function useOrientation(): Orientation {
  const { width, height } = useWindowDimensions();
  return width > height ? 'landscape' : 'portrait';
}
