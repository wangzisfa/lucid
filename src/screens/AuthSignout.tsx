import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { TermAppBar } from '@/components/TermAppBar';
import { VimBar } from '@/components/form/VimBar';
import { colors, fonts } from '@/theme/tokens';
import { useAuth } from '@/lib/auth-store';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthSignout'>;

/** 22 — sign-out confirm modal over a dimmed account view. */
export function AuthSignout({ navigation }: Props) {
  const signOut = useAuth((s) => s.signOut);

  const confirm = () => {
    signOut();
    navigation.reset({ index: 0, routes: [{ name: 'AuthLogin' }] });
  };

  return (
    <Screen>
      <TermAppBar title="~/settings/account" chip="CONF" />
      <View style={styles.stage}>
        {/* dimmed faux context */}
        <View style={styles.dimmed} pointerEvents="none">
          <Text style={styles.dimHead}>:Account</Text>
          <Text style={styles.dimNote}>// ~/.lucidrc</Text>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.ghost} />
          ))}
        </View>

        {/* modal */}
        <View style={styles.modal}>
          <View style={styles.modalHead}>
            <Text style={styles.modalHeadText}>:CONFIRM</Text>
            <Text style={styles.modalHeadText}>sign-out · esc to cancel</Text>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.heading}>
              Sign out of <Text style={{ color: colors.rose }}>lucid</Text>?
            </Text>
            <Text style={styles.body}>
              this device only · 2 active sessions remain.{'\n'}
              running agents will be paused · drafts kept.
            </Text>
            <View style={styles.shell}>
              <Text style={styles.shellLine}>$ lucid auth signout --device this</Text>
              <Text style={styles.shellSub}>↳ revoke refresh-token · drop secure-enclave key</Text>
              <Text style={styles.shellSub}>↳ purge cache · 14.2mb</Text>
            </View>
            <View style={styles.btnRow}>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => navigation.goBack()}>
                <Text style={styles.btnGhostText}>[esc] cancel</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnFill]} onPress={confirm}>
                <Text style={styles.btnFillText}>[↵] sign out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      <VimBar mode="VOICE" cmd=":q! signout" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, padding: 14 },
  dimmed: { opacity: 0.25 },
  dimHead: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  dimNote: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5, marginBottom: 12 },
  ghost: { height: 26, marginBottom: 6, backgroundColor: 'rgba(255,255,255,0.04)' },
  modal: { position: 'absolute', top: 60, left: 14, right: 14, borderWidth: 1, borderColor: colors.rose, backgroundColor: '#150b11' },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.rose, paddingHorizontal: 10, paddingVertical: 6 },
  modalHeadText: { color: '#000', fontFamily: fonts.monoFallback, fontSize: 9.5, fontWeight: '700', letterSpacing: 1 },
  modalBody: { padding: 14, gap: 10 },
  heading: { color: colors.textHi, fontFamily: fonts.display, fontStyle: 'italic', fontSize: 22, lineHeight: 26 },
  body: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 10.5, lineHeight: 16 },
  shell: { padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  shellLine: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 10, lineHeight: 16 },
  shellSub: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 10, lineHeight: 16 },
  btnRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderWidth: 1 },
  btnGhost: { borderColor: colors.glassBorderBright, backgroundColor: 'transparent' },
  btnGhostText: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 11, fontWeight: '600' },
  btnFill: { borderColor: colors.rose, backgroundColor: colors.rose },
  btnFillText: { color: '#000', fontFamily: fonts.monoFallback, fontSize: 11, fontWeight: '700' },
});
