import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { VimBar } from '@/components/form/VimBar';
import { colors, fonts } from '@/theme/tokens';
import { mockIdentity, useAuth } from '@/lib/auth-store';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthSuccess'>;

/** 19 — identity confirmation. Marks auth, then auto-advances to repos. */
export function AuthSuccess({ navigation, route }: Props) {
  const provider = route.params?.provider ?? 'google';
  const signIn = useAuth((s) => s.signIn);
  const identity = mockIdentity(provider);

  const go = () => navigation.reset({ index: 0, routes: [{ name: 'Repos' }] });

  useEffect(() => {
    signIn(provider);
    const t = setTimeout(go, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const log = [
    '✓ callback received · code=4/0AeaY...',
    '✓ token exchange · 142ms',
    `✓ identity verified · ${identity.email}`,
    '✓ refresh token stored · SecureStore',
    '✓ session opened · sid_01HXG8KP',
    '→ jumping to ~/repos…',
  ];

  return (
    <Pressable style={styles.flex} onPress={go}>
      <Screen style={styles.screen}>
        <View style={styles.brand}>
          <View style={styles.dot} />
          <Text style={styles.brandName}>LUCID</Text>
          <Text style={styles.dim}>· authenticated</Text>
          <Text style={[styles.ok, styles.right]}>OK · 200</Text>
        </View>

        <View style={styles.log}>
          {log.map((l, i) => (
            <Text key={i} style={[styles.logLine, { color: l.startsWith('→') ? colors.rose : colors.mint }]}>{l}</Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.kicker}>// IDENTITY</Text>
          <View style={styles.idRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{identity.initials}</Text></View>
            <View style={styles.idMeta}>
              <Text style={styles.name}>{identity.name}</Text>
              <Text style={styles.email}>{identity.email}</Text>
              <Text style={styles.via}>via {provider} · oauth pkce</Text>
            </View>
          </View>
        </View>

        <View style={styles.opening}>
          <Text style={styles.openingText}>
            <Text style={{ color: colors.rose }}>› </Text>
            <Text style={{ color: colors.textMid }}>opening </Text>
            <Text style={{ color: colors.cyan }}>~/repos ▮</Text>
          </Text>
        </View>

        <Text style={styles.foot}>// session ends in 30d · tap to continue</Text>

        <View style={styles.barWrap}>
          <VimBar mode="NORMAL" cmd=":cd ~/repos" />
        </View>
      </Screen>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { paddingHorizontal: 18, paddingTop: 20 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, backgroundColor: colors.mint },
  brandName: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 11.5, fontWeight: '600' },
  dim: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  right: { marginLeft: 'auto' },
  ok: { color: colors.mint, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  log: { marginTop: 14 },
  logLine: { fontFamily: fonts.monoFallback, fontSize: 11.5, lineHeight: 17 },
  card: { marginTop: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(94,255,178,0.3)', backgroundColor: 'rgba(94,255,178,0.04)', gap: 8 },
  kicker: { color: colors.mint, fontFamily: fonts.monoFallback, fontSize: 9.5, letterSpacing: 1.2 },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderWidth: 1, borderColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.mint, fontFamily: fonts.monoFallback, fontSize: 18, fontWeight: '700' },
  idMeta: { gap: 1 },
  name: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 13, fontWeight: '600' },
  email: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 10 },
  via: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  opening: { marginTop: 20, padding: 10, borderWidth: 1, borderColor: 'rgba(255,138,180,0.3)', borderStyle: 'dashed', backgroundColor: 'rgba(255,138,180,0.04)' },
  openingText: { fontFamily: fonts.monoFallback, fontSize: 11.5 },
  foot: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9, marginTop: 12 },
  barWrap: { marginTop: 'auto', marginHorizontal: -18 },
});
