import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, toneColor, type Tone } from '@/theme/tokens';

interface Props {
  /** The bracket key — the affordance the design references (`[g]`, `[x]`…). */
  k: string;
  label: string;
  tone?: Tone;
  /** Right-aligned highlight (e.g. `pkce`, `+ repo scope`). */
  hi?: string;
  /** Secondary line under the label. */
  sub?: string;
  /** Rose accent bar + wash — the "recommended" treatment. */
  recommended?: boolean;
  onPress?: () => void;
}

/**
 * Command-driven row shared across the auth flow. The bracketed key is the
 * brand reference — there are no vendor logos anywhere (per the design brief).
 */
export function AuthLine({ k, label, tone = 'hi', hi, sub, recommended, onPress }: Props) {
  const accent = toneColor(tone);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.wrap,
        recommended && styles.recommended,
        pressed && onPress && styles.pressed,
      ]}
    >
      <View style={styles.row}>
        <Text style={styles.key}>
          <Text style={styles.bracket}>[</Text>
          <Text style={styles.keyChar}>{k}</Text>
          <Text style={styles.bracket}>]</Text>
        </Text>
        <Text style={[styles.label, { color: accent }]} numberOfLines={1}>
          {label}
        </Text>
        {hi ? <Text style={[styles.hi, { color: accent }]}>{hi}</Text> : null}
      </View>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 6, paddingHorizontal: 8, marginHorizontal: -8 },
  recommended: {
    borderLeftWidth: 2,
    borderLeftColor: colors.rose,
    backgroundColor: 'rgba(255,138,180,0.06)',
  },
  pressed: { backgroundColor: 'rgba(255,255,255,0.05)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  key: { fontFamily: fonts.monoFallback, fontSize: 11.5 },
  bracket: { color: colors.rose },
  keyChar: { color: colors.textHi, fontWeight: '700' },
  label: { flex: 1, fontFamily: fonts.monoFallback, fontSize: 11.5 },
  hi: { fontFamily: fonts.monoFallback, fontSize: 10.5 },
  sub: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5, paddingLeft: 30, marginTop: 1 },
});
