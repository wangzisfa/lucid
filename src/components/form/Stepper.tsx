import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, toneColor, type Tone } from '@/theme/tokens';

interface Props<T extends string> {
  value: T;
  options: readonly T[];
  color?: Tone;
  onChange: (v: T) => void;
}

/**
 * `‹ value ›` cycler — the RN translation of the web `Stepper`. Tapping the
 * arrows steps through `options` (wrapping at the ends).
 */
export function Stepper<T extends string>({
  value,
  options,
  color = 'cyan',
  onChange,
}: Props<T>) {
  const accent = toneColor(color);
  const idx = Math.max(0, options.indexOf(value));
  const step = (dir: -1 | 1) => {
    const next = (idx + dir + options.length) % options.length;
    onChange(options[next]);
  };
  return (
    <View style={styles.row}>
      <Pressable hitSlop={8} onPress={() => step(-1)} style={styles.arrow}>
        <Text style={[styles.arrowText, { color: accent }]}>‹</Text>
      </Pressable>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Pressable hitSlop={8} onPress={() => step(1)} style={styles.arrow}>
        <Text style={[styles.arrowText, { color: accent }]}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  arrow: { paddingHorizontal: 2 },
  arrowText: { fontFamily: 'monospace', fontSize: 14, fontWeight: '700' },
  value: {
    fontFamily: 'monospace',
    fontSize: 11,
    minWidth: 64,
    textAlign: 'center',
  },
});
