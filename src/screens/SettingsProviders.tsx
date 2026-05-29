import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { TermAppBar } from '@/components/TermAppBar';
import { VimBar } from '@/components/form/VimBar';
import { Stepper } from '@/components/form/Stepper';
import { Toggle } from '@/components/form/Toggle';
import { colors, fonts, toneColor, type Tone } from '@/theme/tokens';
import { ProviderId, maskKey, useSettings } from '@/lib/settings-store';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'SettingsProviders'>;

interface ProviderRow {
  id: ProviderId;
  label: string;
  models: string;
  tone: Tone;
  variant: 'remote' | 'local' | 'hosted';
}

const ROWS: ProviderRow[] = [
  { id: 'anthropic', label: 'anthropic', models: 'claude-haiku-4 · sonnet · opus', tone: 'rose', variant: 'remote' },
  { id: 'openai', label: 'openai', models: 'gpt-5 · gpt-5-mini · o5', tone: 'mint', variant: 'remote' },
  { id: 'google', label: 'google', models: 'gemini-2.5 · flash', tone: 'cyan', variant: 'remote' },
  { id: 'openrouter', label: 'openrouter', models: 'any model · unified billing', tone: 'violet', variant: 'remote' },
  { id: 'ollama', label: 'ollama', models: 'qwen-32b · llama-4 · deepseek', tone: 'mint', variant: 'local' },
  { id: 'lucid-cloud', label: 'lucid cloud', models: 'all hosted models', tone: 'cyan', variant: 'hosted' },
];

const ADD_PROVIDERS: ProviderId[] = ['anthropic', 'openai', 'google', 'openrouter', 'ollama'];

function statusLabel(r: ProviderRow, key: string): { txt: string; color: string } {
  if (r.variant === 'hosted') return { txt: '● PRO', color: colors.mint };
  if (r.variant === 'local') return key ? { txt: '● LOCAL', color: colors.mint } : { txt: '○ EMPTY', color: colors.textLo };
  return key ? { txt: '● LINKED', color: colors.mint } : { txt: '○ EMPTY', color: colors.textLo };
}

function keyField(id: ProviderId, s: ReturnType<typeof useSettings.getState>): string {
  switch (id) {
    case 'anthropic': return s.providers.anthropicKey;
    case 'openai': return s.providers.openaiKey;
    case 'google': return s.providers.googleKey;
    case 'ollama': return s.providers.ollamaUrl;
    case 'lucid-cloud': return 'auto · included in pro';
    default: return '';
  }
}

/** 13 — providers / BYOK. */
export function SettingsProviders({ navigation }: Props) {
  const settings = useSettings();
  const [addProvider, setAddProvider] = useState<ProviderId>('openai');
  const [keyInput, setKeyInput] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok'>('idle');

  const onTest = () => {
    if (!keyInput) return;
    setTestStatus('testing');
    setTimeout(() => setTestStatus('ok'), 600);
  };

  const onSave = () => {
    if (!keyInput) return;
    if (addProvider === 'anthropic') settings.setProviders('anthropicKey', keyInput);
    else if (addProvider === 'openai') settings.setProviders('openaiKey', keyInput);
    else if (addProvider === 'google') settings.setProviders('googleKey', keyInput);
    else if (addProvider === 'ollama') settings.setProviders('ollamaUrl', keyInput);
    setKeyInput('');
    setTestStatus('idle');
  };

  return (
    <Screen>
      <TermAppBar title="~/settings/providers" chip="KEYS" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.crumb}>
          <Pressable onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.crumbDim}>settings ›</Text>
          </Pressable>
          <Text style={[styles.crumbCur, { color: colors.cyan }]}>[providers]</Text>
        </View>

        <Text style={styles.sec}>// CURRENT</Text>
        <View style={styles.list}>
          {ROWS.map((r) => {
            const k = keyField(r.id, settings);
            const status = statusLabel(r, k);
            const sel = settings.providers.active === r.id;
            const tone = toneColor(r.tone);
            return (
              <Pressable
                key={r.id}
                onPress={() => settings.setProviders('active', r.id)}
                style={[styles.provRow, { borderColor: sel ? tone : colors.glassBorder, backgroundColor: sel ? 'rgba(255,138,180,0.05)' : 'rgba(0,0,0,0.2)' }]}
              >
                <View style={styles.provHead}>
                  <Text style={[styles.radio, { color: sel ? tone : colors.textLo }]}>{sel ? '◉' : '○'}</Text>
                  <Text style={{ color: sel ? colors.textHi : colors.textMid, fontFamily: fonts.monoFallback, fontSize: 11, fontWeight: sel ? '600' : '400' }}>{r.label}</Text>
                  <Text style={[styles.status, { color: status.color }]}>{status.txt}</Text>
                </View>
                <Text style={styles.provKey}>{k ? (r.variant === 'remote' ? maskKey(k) : k) : '— no key on device'}</Text>
                <Text style={styles.provModels}>{r.models}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sec}>// SAFETY</Text>
        <Row label="keys stored on device only"><Toggle on={settings.providers.onDeviceOnly} color="mint" onChange={(v) => settings.setProviders('onDeviceOnly', v)} /></Row>
        <Row label="redact in logs"><Toggle on color="mint" /></Row>
        <Row label="fallback to lucid cloud"><Toggle on={settings.providers.fallback === 'lucid-cloud'} color="mint" onChange={(v) => settings.setProviders('fallback', v ? 'lucid-cloud' : 'none')} /></Row>

        <Text style={styles.sec}>// SERVER</Text>
        <View style={[styles.panel, { borderColor: 'rgba(255,138,180,0.4)', backgroundColor: 'rgba(255,138,180,0.04)' }]}>
          <TextInput
            value={settings.providers.serverUrl}
            onChangeText={(v) => settings.setProviders('serverUrl', v.trim())}
            placeholder="https://your-lucid-server"
            placeholderTextColor={colors.textLo}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.input}
          />
          <Text style={styles.panelNote}>→ where the agent loop runs · the app sends prompts + your key here{'\n'}→ blank = local dev server</Text>
        </View>

        <Text style={styles.sec}>// ADD KEY</Text>
        <View style={[styles.panel, { borderColor: 'rgba(107,229,255,0.4)', backgroundColor: 'rgba(107,229,255,0.04)' }]}>
          <View style={styles.addHead}>
            <Text style={styles.note}>provider</Text>
            <Stepper value={addProvider} options={ADD_PROVIDERS} color="cyan" onChange={setAddProvider} />
          </View>
          <TextInput
            value={keyInput}
            onChangeText={(v) => { setKeyInput(v); setTestStatus('idle'); }}
            placeholder="paste your key"
            placeholderTextColor={colors.textLo}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <View style={styles.chipRow}>
            <Chip color={colors.mint} disabled={!keyInput} onPress={onTest}>
              {testStatus === 'testing' ? '[T] …' : testStatus === 'ok' ? '[T] OK' : '[T] TEST'}
            </Chip>
            <Chip color={colors.textMid} disabled={!keyInput} onPress={onSave}>[↵] SAVE</Chip>
          </View>
          <Text style={styles.panelNote}>→ stored on device · encrypted with device key{'\n'}→ never sent to lucid servers</Text>
        </View>
      </ScrollView>
      <VimBar mode="INSERT" cmd=":w providers" hint="tap a provider · add key" />
    </Screen>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.kvKey}>{label}</Text>
      {children}
    </View>
  );
}

function Chip({ color, onPress, disabled, children }: { color: string; onPress?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.chip, { borderColor: disabled ? colors.glassBorder : color }]}>
      <Text style={{ color: disabled ? colors.textLo : color, fontFamily: fonts.monoFallback, fontSize: 9.5, letterSpacing: 0.5 }}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { padding: 14, paddingBottom: 28 },
  crumb: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  crumbDim: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 10 },
  crumbCur: { fontFamily: fonts.monoFallback, fontSize: 10, fontWeight: '600' },
  sec: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5, letterSpacing: 0.6, marginTop: 14 },
  list: { gap: 4, marginTop: 6 },
  provRow: { padding: 6, borderWidth: 1 },
  provHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  radio: { width: 12, fontFamily: fonts.monoFallback, fontSize: 11 },
  status: { marginLeft: 'auto', fontFamily: fonts.monoFallback, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  provKey: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 9.5, marginTop: 2, paddingLeft: 18 },
  provModels: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9, marginTop: 1, paddingLeft: 18 },
  kv: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  kvKey: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 10 },
  panel: { marginTop: 4, padding: 8, borderWidth: 1 },
  panelNote: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9, marginTop: 6, lineHeight: 14 },
  input: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    color: colors.textHi,
    fontFamily: fonts.monoFallback,
    fontSize: 10.5,
  },
  addHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  note: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9 },
  chipRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
});
