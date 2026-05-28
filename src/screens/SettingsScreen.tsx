import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { TermAppBar } from '@/components/TermAppBar';
import { colors, fonts } from '@/theme/tokens';
import { useSettings } from '@/lib/settings-store';
import { useSessions } from '@/lib/store';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const providers = useSettings((s) => s.providers);
  const setProviders = useSettings((s) => s.setProviders);
  const model = useSettings((s) => s.agent.model);
  const resetAll = useSessions((s) => s.resetAll);

  return (
    <Screen>
      <TermAppBar title="settings" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.section}>// providers</Text>

        <Field label="server url (required on mobile)">
          <TextInput
            value={providers.serverUrl}
            onChangeText={(v) => setProviders('serverUrl', v)}
            placeholder="https://your-lucid-server"
            placeholderTextColor={colors.textLo}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.input}
          />
        </Field>

        <Field label="anthropic api key (BYOK)">
          <TextInput
            value={providers.anthropicKey}
            onChangeText={(v) => setProviders('anthropicKey', v)}
            placeholder="sk-ant-…"
            placeholderTextColor={colors.textLo}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            style={styles.input}
          />
        </Field>

        <Text style={styles.section}>// agent</Text>
        <Text style={styles.meta}>model · {model}</Text>

        <Pressable onPress={() => { resetAll(); navigation.navigate('Boot'); }} style={styles.reset}>
          <Text style={styles.resetText}>:reset sessions</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 12, gap: 12 },
  section: { color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 11, letterSpacing: 0.6, marginTop: 6 },
  field: { gap: 6 },
  label: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 12 },
  input: {
    color: colors.textHi,
    fontFamily: fonts.monoFallback,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.bgElev1,
  },
  meta: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 12 },
  reset: {
    marginTop: 18,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,138,180,0.5)',
  },
  resetText: { color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 11 },
});
