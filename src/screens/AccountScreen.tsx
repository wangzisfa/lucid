import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { TermAppBar } from '@/components/TermAppBar';
import { VimBar } from '@/components/form/VimBar';
import { colors, fonts } from '@/theme/tokens';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

interface ProviderRow {
  k: string;
  label: string;
  hint: string;
  pill: string;
  pillColor: string;
  linked: boolean;
}

const PROVIDERS: ProviderRow[] = [
  { k: 'g', label: 'google', hint: 'iris@hey.com · 32d', pill: 'PRIMARY', pillColor: colors.rose, linked: true },
  { k: 'h', label: 'github', hint: '@irisc · repos: 14', pill: 'LINKED', pillColor: colors.cyan, linked: true },
  { k: 'a', label: 'apple', hint: 'link to enable ios passkey', pill: 'LINK', pillColor: colors.textLo, linked: false },
  { k: '·', label: 'email', hint: 'magic-link fallback', pill: 'LINK', pillColor: colors.textLo, linked: false },
];

/**
 * 21 — account / linked providers (lives under settings). Currently a static
 * render of the design; it will become live once the auth flow (17–23) and a
 * real identity store land.
 */
export function AccountScreen(_props: Props) {
  return (
    <Screen>
      <TermAppBar title="~/settings/account" chip="CONF" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.head}>:Account</Text>
        <Text style={styles.sub}>// ~/.lucidrc · identity + linked providers</Text>

        {/* identity card */}
        <View style={styles.idCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>IR</Text></View>
          <View style={styles.idMeta}>
            <Text style={styles.name}>Iris Chen</Text>
            <Text style={styles.email}>iris@hey.com</Text>
            <Text style={styles.idSub}>
              <Text style={{ color: colors.mint }}>● pro</Text> · 142h used · since may '25
            </Text>
          </View>
        </View>

        <Text style={styles.divider}>LINKED PROVIDERS · 2 of 4</Text>
        {PROVIDERS.map((p) => (
          <View key={p.label} style={styles.provRow}>
            <Text style={styles.hotkey}>{p.k}</Text>
            <Text style={[styles.provLabel, { color: p.linked ? colors.textHi : colors.textLo }]}>[{p.label}]</Text>
            <Text style={styles.provHint} numberOfLines={1}>{p.hint}</Text>
            <Text style={[styles.pill, { color: p.pillColor, borderColor: p.pillColor }]}>{p.pill}</Text>
          </View>
        ))}

        {/* session box */}
        <View style={styles.sessionBox}>
          {[
            ['session', 'sid_01HXG8KPQ'],
            ['opened', '12 may · iphone 15 pro'],
            ['expires', 'in 28d · auto-refresh'],
            ['devices', '2 active (view all)'],
          ].map(([k, v]) => (
            <View key={k} style={styles.sessionRow}>
              <Text style={styles.sessionKey}>{k}</Text>
              <Text style={styles.sessionVal}>· {v}</Text>
            </View>
          ))}
        </View>

        {/* danger */}
        <DangerRow k="x" label="sign out · this device" />
        <DangerRow k="X" label="sign out · all devices" />
        <DangerRow k="!" label="delete account · 14d cool-down" muted />
      </ScrollView>
      <VimBar mode="NORMAL" cmd=":w" hint="j/k · esc" />
    </Screen>
  );
}

function DangerRow({ k, label, muted }: { k: string; label: string; muted?: boolean }) {
  return (
    <Pressable style={styles.dangerRow}>
      <Text style={styles.dangerKey}>{k}</Text>
      <Text style={[styles.dangerLabel, muted && { color: colors.textMid }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { padding: 14, paddingBottom: 28 },
  head: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 13, fontWeight: '600' },
  sub: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5, marginTop: 2, marginBottom: 12 },
  idCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,138,180,0.3)', backgroundColor: 'rgba(255,138,180,0.04)' },
  avatar: { width: 48, height: 48, borderWidth: 1, borderColor: colors.rose, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 18, fontWeight: '700' },
  idMeta: { gap: 2, flex: 1 },
  name: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 14, fontWeight: '600' },
  email: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 10 },
  idSub: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  divider: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5, letterSpacing: 0.6, marginTop: 16, marginBottom: 6 },
  provRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.04)' },
  hotkey: { width: 16, textAlign: 'center', color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 10, borderWidth: 1, borderColor: colors.glassBorderBright, paddingVertical: 1 },
  provLabel: { minWidth: 70, fontFamily: fonts.monoFallback, fontSize: 11.5 },
  provHint: { flex: 1, color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  pill: { fontFamily: fonts.monoFallback, fontSize: 8.5, fontWeight: '700', letterSpacing: 0.6, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 1 },
  sessionBox: { marginTop: 16, padding: 10, borderWidth: 1, borderColor: colors.glassBorder, borderStyle: 'dashed', gap: 3 },
  sessionRow: { flexDirection: 'row', gap: 8 },
  sessionKey: { width: 64, color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  sessionVal: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  dangerKey: { width: 16, textAlign: 'center', color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 11, borderWidth: 1, borderColor: 'rgba(255,138,180,0.5)', paddingVertical: 1 },
  dangerLabel: { color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 11.5 },
});
