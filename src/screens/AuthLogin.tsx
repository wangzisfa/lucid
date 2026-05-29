import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { AuthLine } from '@/components/AuthLine';
import { VimBar } from '@/components/form/VimBar';
import { colors, fonts } from '@/theme/tokens';
import { useAuth } from '@/lib/auth-store';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthLogin'>;

/** 17 — provider picker. Command-driven; the bracketed key IS the brand. */
export function AuthLogin({ navigation }: Props) {
  const signIn = useAuth((s) => s.signIn);

  const guest = () => {
    signIn('guest');
    navigation.reset({ index: 0, routes: [{ name: 'Repos' }] });
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.brand}>
        <View style={styles.dot} />
        <Text style={styles.brandName}>LUCID</Text>
        <Text style={styles.dim}>· auth</Text>
        <Text style={[styles.dim, styles.right]}>unauthenticated</Text>
      </View>

      <View>
        <Text style={styles.cmd}>
          <Text style={{ color: colors.rose }}>$ </Text>
          <Text style={{ color: colors.textHi }}>lucid auth</Text>
          <Text style={{ color: colors.cyan }}> --provider</Text>
          <Text style={styles.dim}> {'<p>'}</Text>
        </Text>
        <Text style={styles.note}>// pick a sign-in method · we'll open a secure browser tab</Text>
      </View>

      <View style={styles.providers}>
        <Text style={styles.divider}>PROVIDERS · 4 available</Text>
        <AuthLine
          k="g"
          label="sign in with google"
          tone="rose"
          hi="pkce"
          sub="identity only · email + avatar · no drive/calendar"
          recommended
          onPress={() => navigation.navigate('AuthBridge', { provider: 'google' })}
        />
        <AuthLine
          k="h"
          label="sign in with github"
          tone="cyan"
          hi="+ repo scope"
          sub="best for devs · clone + push to your repos"
          onPress={() => navigation.navigate('AuthBridge', { provider: 'github' })}
        />
        <AuthLine
          k="a"
          label="sign in with apple"
          tone="mint"
          hi="ios native"
          onPress={() => navigation.navigate('AuthBridge', { provider: 'apple' })}
        />
        <AuthLine k="·" label="continue as guest" tone="lo" hi="30 min" onPress={guest} />
      </View>

      <View style={styles.prompt}>
        <Text style={styles.promptLine}>
          <Text style={{ color: colors.rose }}>› </Text>
          <Text style={{ color: colors.textMid }}>press </Text>
          <Text style={{ color: colors.textHi, fontWeight: '700' }}>g ▮</Text>
        </Text>
        <Text style={styles.note}>tokens stored in secure-enclave · refresh handled silently</Text>
      </View>

      <Text style={styles.legal}>// by continuing you accept ~/.lucid/terms · ~/.lucid/privacy</Text>

      <View style={styles.barWrap}>
        <VimBar mode="NORMAL" cmd=":auth google" hint="tap a provider" />
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
  cmd: { fontFamily: fonts.monoFallback, fontSize: 11.5, marginTop: 14 },
  note: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5, marginTop: 4 },
  providers: { marginTop: 16 },
  divider: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: colors.glassBorder, marginBottom: 6 },
  prompt: { marginTop: 24, padding: 10, borderWidth: 1, borderColor: 'rgba(255,138,180,0.3)', borderStyle: 'dashed', backgroundColor: 'rgba(255,138,180,0.04)' },
  promptLine: { fontFamily: fonts.monoFallback, fontSize: 11.5 },
  legal: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9, marginTop: 14, lineHeight: 13 },
  barWrap: { marginTop: 'auto', marginHorizontal: -18 },
});
