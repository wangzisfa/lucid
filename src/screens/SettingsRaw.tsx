import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { TermAppBar } from '@/components/TermAppBar';
import { VimBar } from '@/components/form/VimBar';
import { colors, fonts } from '@/theme/tokens';
import { pickSettings, useSettings } from '@/lib/settings-store';
import { settingsToToml, tomlToSettings, type ParseError } from '@/lib/lucidrc';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'SettingsRaw'>;

/**
 * 15 — raw `.lucidrc` editor. An editable mono buffer validated live against
 * the TOML round-trip; `:w` (WRITE) commits the parsed settings back into the
 * store. The web build overlaid a syntax-highlight layer on a transparent
 * textarea; on RN we keep the same buffer/validate/commit behavior with a
 * single mono field (overlay highlighting is a later refinement).
 */
export function SettingsRaw({ navigation }: Props) {
  const settings = useSettings();
  const live = useMemo(() => settingsToToml(pickSettings(settings)), [settings]);
  const [buffer, setBuffer] = useState(live);
  const [error, setError] = useState<ParseError | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(Date.now());

  const onChange = (v: string) => {
    setBuffer(v);
    const r = tomlToSettings(v);
    setError(r.ok ? null : r.error ?? null);
  };

  const save = () => {
    const r = tomlToSettings(buffer);
    if (r.ok && r.value) {
      settings.replace(r.value);
      const next = settingsToToml(r.value);
      setBuffer(next);
      setError(null);
      setSavedAt(Date.now());
    } else {
      setError(r.error ?? { line: 0, message: 'unknown parse error' });
    }
  };

  return (
    <Screen>
      <TermAppBar title="~/.lucidrc" chip="CONF" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.statusRow}>
          <Text style={styles.path}>
            ~/.lucidrc <Text style={styles.dim}>· readonly: false</Text>
          </Text>
          {error ? (
            <Text style={styles.err}>● err line {error.line}</Text>
          ) : savedAt ? (
            <Text style={styles.ok}>● saved</Text>
          ) : null}
        </View>

        <TextInput
          value={buffer}
          onChangeText={onChange}
          multiline
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.editor, { borderColor: error ? 'rgba(255,138,180,0.5)' : colors.glassBorder }]}
        />

        {error ? (
          <View style={styles.errBox}>
            <Text style={styles.errText}>line {error.line}: {error.message}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerHint}>
            <Text style={{ color: colors.cyan }}>:w</Text> to save ·{' '}
            <Text style={{ color: colors.rose }}>:q</Text> to abandon
          </Text>
          <Pressable onPress={save} disabled={!!error} style={[styles.write, { borderColor: error ? colors.glassBorder : colors.mint }]}>
            <Text style={{ color: error ? colors.textLo : colors.mint, fontFamily: fonts.monoFallback, fontSize: 9.5, letterSpacing: 0.5 }}>WRITE</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => navigation.navigate('Settings')} style={styles.back}>
          <Text style={styles.dim}>‹ back to settings</Text>
        </Pressable>
      </ScrollView>
      <VimBar mode="INSERT" cmd=":w lucidrc" hint=":w · :q" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 14, paddingBottom: 28 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  path: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 10, fontWeight: '700' },
  dim: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  err: { color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  ok: { color: colors.mint, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  editor: {
    minHeight: 380,
    padding: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    color: colors.cyan,
    fontFamily: fonts.monoFallback,
    fontSize: 11,
    lineHeight: 16,
    textAlignVertical: 'top',
  },
  errBox: { marginTop: 6, padding: 6, borderWidth: 1, borderColor: 'rgba(255,138,180,0.4)', backgroundColor: 'rgba(255,138,180,0.06)' },
  errText: { color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  footer: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerHint: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  write: { paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  back: { marginTop: 14 },
});
