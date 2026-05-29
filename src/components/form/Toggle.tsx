import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, toneColor, type Tone } from '@/theme/tokens';

interface Props {
  on: boolean;
  color?: Tone;
  onChange?: (v: boolean) => void;
}

/**
 * Terminal-style boolean toggle. A two-cell track `[on ]`/`[ off]`; the lit
 * cell uses the tone color. Read-only when `onChange` is omitted (matches the
 * web `Toggle`, which renders some always-on rows).
 */
export function Toggle({ on, color = 'mint', onChange }: Props) {
  const accent = toneColor(color);
  const disabled = !onChange;
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on, disabled }}
      disabled={disabled}
      onPress={() => onChange?.(!on)}
      style={[styles.track, { borderColor: on ? accent : colors.glassBorder }]}
    >
      <View
        style={[
          styles.cell,
          on && { backgroundColor: accent },
        ]}
      >
        <Text style={[styles.label, on ? styles.labelOn : styles.labelOff]}>
          {on ? 'on' : 'off'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    minWidth: 42,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cell: { paddingHorizontal: 8, paddingVertical: 2, alignItems: 'center' },
  label: { fontFamily: 'monospace', fontSize: 10, letterSpacing: 0.8 },
  labelOn: { color: '#07060f', fontWeight: '700' },
  labelOff: { color: colors.textLo },
});
