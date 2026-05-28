import React, { useEffect } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { colors, fonts } from '@/theme/tokens';
import { useSessions } from '@/lib/store';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'Boot'>;

/**
 * Cold-start handshake. If the user already has sessions, skip straight to the
 * agents list / the single session so a relaunch doesn't trap them here.
 */
export function BootScreen({ navigation }: Props) {
  const order = useSessions((s) => s.order);

  useEffect(() => {
    if (order.length === 1) navigation.replace('Session');
    else if (order.length > 1) navigation.replace('Agents');
  }, [order.length, navigation]);

  return (
    <Screen style={styles.center}>
      <Text style={styles.wordmark}>Lucid</Text>
      <Text style={styles.tag}>// voice-first mobile coding agent</Text>

      <Pressable
        onPress={() => navigation.navigate('Repos')}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        accessibilityRole="button"
      >
        <Text style={styles.ctaText}>[ begin ]</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 14 },
  wordmark: {
    color: colors.textHi,
    fontFamily: fonts.display,
    fontSize: 56,
    fontStyle: 'italic',
  },
  tag: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 12 },
  cta: {
    marginTop: 28,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.rose,
  },
  ctaPressed: { backgroundColor: 'rgba(255,138,180,0.10)' },
  ctaText: { color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 14, letterSpacing: 1 },
});
