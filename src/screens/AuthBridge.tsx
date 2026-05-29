import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { AuthLine } from '@/components/AuthLine';
import { VimBar } from '@/components/form/VimBar';
import { colors, fonts } from '@/theme/tokens';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthBridge'>;

const SPINNER = ['◐', '◓', '◑', '◒'];

const LOG = [
  { c: colors.mint, t: '✓ pkce verifier generated · sha256' },
  { c: colors.mint, t: '✓ state nonce signed · 32b' },
  { c: colors.mint, t: '✓ deep-link registered · lucid://auth/cb' },
  { c: colors.mint, t: '✓ opened accounts handoff · oauth2' },
  { c: colors.amber, t: '◐ waiting for consent…' },
];

/**
 * 18 — OAuth handoff. Mock: fakes a polling sequence and auto-advances. `apple`
 * deterministically "fails" (no entitlements in this mock) so the error screen
 * is reachable; everything else succeeds.
 */
export function AuthBridge({ navigation, route }: Props) {
  const provider = route.params?.provider ?? 'google';
  const [tick, setTick] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [nonce, setNonce] = useState(0); // bump to restart on resend
  const spinRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    spinRef.current = setInterval(() => {
      setTick((t) => t + 1);
      setElapsed((e) => e + 0.2);
    }, 200);
    const done = setTimeout(() => {
      if (provider === 'apple') navigation.replace('AuthError', { provider });
      else navigation.replace('AuthSuccess', { provider });
    }, 2600);
    return () => {
      if (spinRef.current) clearInterval(spinRef.current);
      clearTimeout(done);
    };
  }, [navigation, provider, nonce]);

  return (
    <Screen style={styles.screen}>
      <View style={styles.brand}>
        <View style={styles.dot} />
        <Text style={styles.brandName}>LUCID</Text>
        <Text style={styles.dim}>· auth · bridge</Text>
        <Text style={[styles.waiting, styles.right]}>WAITING</Text>
      </View>

      <View style={styles.log}>
        {LOG.map((l, i) => (
          <Text key={i} style={[styles.logLine, { color: l.c }]}>{l.t}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardKicker}>// HANDOFF</Text>
        <Text style={styles.cardTitle}>finish sign-in in the browser</Text>
        <Text style={styles.cardBody}>
          we opened a tab for {provider}.{'\n'}confirm there, then it'll bounce back to lucid.
        </Text>
        <View style={styles.spinRow}>
          <Text style={styles.spinner}>{SPINNER[tick % SPINNER.length]}</Text>
          <Text style={styles.polling}>polling /token · {elapsed.toFixed(1)}s</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <AuthLine k="↻" label="resend link" tone="cyan" onPress={() => { setElapsed(0); setNonce((n) => n + 1); }} />
        <AuthLine k="x" label="cancel · use another provider" tone="rose" onPress={() => navigation.navigate('AuthLogin')} />
      </View>

      <Text style={styles.req}>// request_id · req_01HXG7K2Z9TPVQ4M</Text>

      <View style={styles.barWrap}>
        <VimBar mode="VOICE" cmd={`waiting on ${provider}…`} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 18, paddingTop: 20 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, backgroundColor: colors.amber },
  brandName: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 11.5, fontWeight: '600' },
  dim: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  right: { marginLeft: 'auto' },
  waiting: { color: colors.amber, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  log: { marginTop: 14 },
  logLine: { fontFamily: fonts.monoFallback, fontSize: 11.5, lineHeight: 17 },
  card: { marginTop: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,197,107,0.4)', borderStyle: 'dashed', backgroundColor: 'rgba(255,197,107,0.04)', gap: 8 },
  cardKicker: { color: colors.amber, fontFamily: fonts.monoFallback, fontSize: 9.5, letterSpacing: 1.2 },
  cardTitle: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 13 },
  cardBody: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 10.5, lineHeight: 16 },
  spinRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  spinner: { color: colors.amber, fontFamily: fonts.monoFallback, fontSize: 18 },
  polling: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 10 },
  actions: { marginTop: 20 },
  req: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9, marginTop: 12 },
  barWrap: { marginTop: 'auto', marginHorizontal: -18 },
});
