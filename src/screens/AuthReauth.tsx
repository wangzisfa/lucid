import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { TermAppBar } from '@/components/TermAppBar';
import { VimBar } from '@/components/form/VimBar';
import { colors, fonts } from '@/theme/tokens';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthReauth'>;

/** 23 — token-expired takeover over a dimmed (paused) session. Non-destructive. */
export function AuthReauth({ navigation }: Props) {
  return (
    <Screen>
      <TermAppBar title="~/idea-garden" chip="IDLE" />
      <View style={styles.stage}>
        {/* dimmed underlying session */}
        <View style={styles.dimmed} pointerEvents="none">
          <Text style={styles.cyan}>› add reflection card at 9pm w/ soft chime</Text>
          <Text style={styles.lo}>voice · 0:12</Text>
          <Text style={[styles.rose, { marginTop: 6 }]}>● lucid · thought 4s</Text>
          <Text style={styles.mid}>├─ ✓ create ReflectionCard.tsx</Text>
          <Text style={styles.mid}>├─ ✓ wire chime hook</Text>
          <Text style={styles.mid}>├─ ◐ schedule cron 21:00</Text>
          <Text style={styles.mid}>└─ ○ mount on home</Text>
        </View>

        {/* banner */}
        <View style={styles.banner}>
          <View style={styles.bannerHead}>
            <Text style={styles.bannerHeadText}>! REAUTH REQUIRED</Text>
            <Text style={styles.bannerHeadText}>401 · token expired</Text>
          </View>
          <View style={styles.bannerBody}>
            <Text style={styles.heading}>Your google session lapsed</Text>
            <Text style={styles.body}>
              refresh-token rejected · grant was revoked or your password changed.
              sign in once more to keep this conversation going.
            </Text>
            <View style={styles.shell}>
              <Text style={styles.shellLo}>$ lucid auth refresh --provider google</Text>
              <Text style={[styles.shellLo, { color: colors.rose }]}>↳ refresh-token denied · invalid_grant</Text>
              <Text style={[styles.shellLo, { color: colors.textMid }]}>↳ session paused · 1 agent on hold</Text>
            </View>
            <View style={styles.grid}>
              <Text style={styles.gridK}>session</Text>
              <Text style={[styles.gridV, { color: colors.amber }]}>PAUSED</Text>
              <Text style={styles.gridK}>drafts kept</Text>
              <Text style={[styles.gridV, { color: colors.mint }]}>YES · 14m ago</Text>
              <Text style={styles.gridK}>token expired</Text>
              <Text style={[styles.gridV, { color: colors.textLo }]}>2m ago</Text>
            </View>
            <View style={styles.btnRow}>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => navigation.navigate('AuthSignout')}>
                <Text style={styles.btnGhostText}>[s] sign out</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnFill, { flex: 2 }]} onPress={() => navigation.replace('AuthBridge', { provider: 'google' })}>
                <Text style={styles.btnFillText}>[g] re-auth with google</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      <VimBar mode="VOICE" cmd=":reauth google" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, padding: 14 },
  dimmed: { opacity: 0.18 },
  cyan: { color: colors.cyan, fontFamily: fonts.monoFallback, fontSize: 11 },
  lo: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  rose: { color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 11 },
  mid: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 11, lineHeight: 16 },
  banner: { position: 'absolute', top: 12, left: 14, right: 14, borderWidth: 1, borderColor: colors.amber, backgroundColor: '#15100a' },
  bannerHead: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.amber, paddingHorizontal: 10, paddingVertical: 5 },
  bannerHeadText: { color: '#000', fontFamily: fonts.monoFallback, fontSize: 9.5, fontWeight: '700', letterSpacing: 1 },
  bannerBody: { padding: 12, gap: 8 },
  heading: { color: colors.textHi, fontFamily: fonts.display, fontStyle: 'italic', fontSize: 19, lineHeight: 22 },
  body: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 10.5, lineHeight: 16 },
  shell: { padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  shellLo: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 10, lineHeight: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  gridK: { width: '50%', color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 10, paddingVertical: 2 },
  gridV: { width: '50%', textAlign: 'right', fontFamily: fonts.monoFallback, fontSize: 10, paddingVertical: 2 },
  btnRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderWidth: 1 },
  btnGhost: { borderColor: colors.glassBorderBright, backgroundColor: 'transparent' },
  btnGhostText: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 10.5, fontWeight: '600' },
  btnFill: { borderColor: colors.amber, backgroundColor: colors.amber },
  btnFillText: { color: '#000', fontFamily: fonts.monoFallback, fontSize: 10.5, fontWeight: '700' },
});
