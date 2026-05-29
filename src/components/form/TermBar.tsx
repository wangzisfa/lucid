import React, { useMemo, useRef, useState } from 'react';
import { View, Text, PanResponder, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { colors, toneColor, type Tone } from '@/theme/tokens';

interface Props {
  /** Current fill as a fraction 0..1. */
  value: number;
  /** Number of cells to render. */
  max: number;
  color?: Tone;
  onChange?: (fraction: number) => void;
}

/**
 * ASCII fill bar `[████░░░░]` that doubles as a slider. The RN translation of
 * the web `TermBar`. Drag/tap maps the touch x-position to a 0..1 fraction and
 * calls `onChange` — implemented with the built-in PanResponder so it needs no
 * gesture-handler dependency.
 */
export function TermBar({ value, max, color = 'cyan', onChange }: Props) {
  const accent = toneColor(color);
  const widthRef = useRef(0);
  const [width, setWidth] = useState(0);

  const emit = (x: number) => {
    const w = widthRef.current;
    if (!w || !onChange) return;
    const f = Math.min(1, Math.max(0, x / w));
    onChange(f);
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !!onChange,
        onMoveShouldSetPanResponder: () => !!onChange,
        onPanResponderGrant: (e) => emit(e.nativeEvent.locationX),
        onPanResponderMove: (e) => emit(e.nativeEvent.locationX),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
    setWidth(e.nativeEvent.layout.width);
  };

  const filled = Math.round(Math.min(1, Math.max(0, value)) * max);
  const cells = '█'.repeat(filled) + '░'.repeat(Math.max(0, max - filled));

  return (
    <View onLayout={onLayout} style={styles.wrap} {...responder.panHandlers}>
      <Text style={[styles.bar, { color: accent }]} numberOfLines={1}>
        {width === 0 ? '' : cells}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 4 },
  bar: { fontFamily: 'monospace', fontSize: 13, letterSpacing: -0.5 },
});
