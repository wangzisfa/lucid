import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { AuthLine } from '@/components/AuthLine';
import { VimBar } from '@/components/form/VimBar';
import { colors, fonts } from '@/theme/tokens';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthError'>;

const LOG = [
  { c: colors.mint, t: '✓ pkce verifier · sha256' },
  { c: colors.mint, t: '✓ deep-link callback · 142ms' },
  { c: colors.mint, t: '✓ code received · 4/0AeaY...' },
  { c: colors.rose, t: '✗ POST /token failed · 401 invalid_grant' },
  { c: colors.rose, t: '✗ session not opened' },
];

/** 20 — sign-in failed. Recovery options re-enter the flow. */
export function AuthError({ navigation, route }: Props) {
  const provider = route.params?.provider ?? 'google';

  return (
    <Screen style={styles.screen}>
      <View style={styles.brand}>
        <View style={styles.dot} />
        <Text style={styles.brandName}>LUCID</Text>
        <Text style={styles.dim}>· auth · failed</Text>
        <Text style={[styles.err, styles.right]}>ERR · 401</Text>
      </View>

      <View style={styles.log}>
        {LOG.map((l, i) => (
          <Text key={i} style={[styles.logLine, { color: l.c }]}>{l.t}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.kicker}>// FAULT</Text>
          <Text style={styles.req}>req_01HXG7K2</Text>
        </View>
        <Text style={styles.title}>{provider} handoff timed out</Text>
        <Text style={styles.body}>
          authorization code expired before we could exchange it.{'\n'}
          this usually means a slow network or you closed the tab.
        </Text>
        <Text style={styles.stackLabel}>stack:</Text>
        <View style={styles.stack}>
          <Text style={styles.stackLine}>├─ AuthBridge.exchange()</Text>
          <Text style={styles.stackLine}>├─ <Text style={{ color: colors.rose }}>oauth.token() ← 401</Text></Text>
          <Text style={styles.stackLine}>└─ network.fetch · timed out @ 30s</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <AuthLine k="r" label="retry · same provider" tone="rose" onPress={() => navigation.replace('AuthBridge', { provider })} />
        <AuthLine k="g" label="try google again from scratch" tone="cyan" onPress={() => navigation.replace('AuthBridge', { provider: 'google' })} />
        <AuthLine k="b" label="back · choose another method" tone="lo" onPress={() => navigation.navigate('AuthLogin')} />
        <AuthLine k="?" label="copy diagnostics to clipboard" tone="lo" onPress={() => Alert.alert('diagnostics', 'req_01HXG7K2 · 401 invalid_grant')} />
      </View>

      <Text style={styles.foot}>// status.lucid.app · all systems nominal</Text>

      <View style={styles.barWrap}>
        <VimBar mode="NORMAL" cmd=":retry" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 18, paddingTop: 20 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, backgroundColor: colors.rose },
  brandName: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 11.5, fontWeight: '600' },
  dim: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  right: { marginLeft: 'auto' },
  err: { color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  log: { marginTop: 14 },
  logLine: { fontFamily: fonts.monoFallback, fontSize: 11.5, lineHeight: 17 },
  card: { marginTop: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,138,180,0.4)', backgroundColor: 'rgba(255,138,180,0.06)', gap: 6 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 9.5, letterSpacing: 1.2 },
  req: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9 },
  title: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 13 },
  body: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 10.5, lineHeight: 16 },
  stackLabel: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5, marginTop: 4 },
  stack: { paddingLeft: 4 },
  stackLine: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 10, lineHeight: 15 },
  actions: { marginTop: 20 },
  foot: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9, marginTop: 12 },
  barWrap: { marginTop: 'auto', marginHorizontal: -18 },
});
