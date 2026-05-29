import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { TermAppBar } from '@/components/TermAppBar';
import { VimBar } from '@/components/form/VimBar';
import { Stepper } from '@/components/form/Stepper';
import { TermBar } from '@/components/form/TermBar';
import { Toggle } from '@/components/form/Toggle';
import { colors, fonts, toneColor, type Tone } from '@/theme/tokens';
import {
  CONTEXT_OPTIONS,
  ContextWindow,
  ModelId,
  ProviderId,
  THINKING_OPTIONS,
  Thinking,
  useSettings,
} from '@/lib/settings-store';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'SettingsModel'>;

interface ModelRow {
  id: ModelId;
  note: string;
  tone: Tone;
  via: ProviderId;
}

const MODELS: ModelRow[] = [
  { id: 'claude-haiku-4', note: 'fast · cheap', tone: 'cyan', via: 'anthropic' },
  { id: 'claude-sonnet-4.5', note: 'balanced · default', tone: 'rose', via: 'anthropic' },
  { id: 'claude-opus-4.1', note: 'deep · slow', tone: 'violet', via: 'anthropic' },
  { id: 'gpt-5', note: 'fast · cheap', tone: 'mint', via: 'openai' },
  { id: 'gemini-2.5', note: 'multimodal', tone: 'cyan', via: 'google' },
  { id: 'qwen-32b', note: 'on-device · 8 t/s', tone: 'mint', via: 'ollama' },
];

function isLinked(via: ProviderId, s: ReturnType<typeof useSettings.getState>): boolean {
  switch (via) {
    case 'anthropic': return !!s.providers.anthropicKey;
    case 'openai': return !!s.providers.openaiKey;
    case 'google': return !!s.providers.googleKey;
    case 'ollama': return !!s.providers.ollamaUrl;
    case 'openrouter': return false;
    case 'lucid-cloud': return true;
  }
}

function contextFraction(c: ContextWindow): number {
  if (c === 50_000) return 0.05;
  if (c === 200_000) return 0.2;
  return 1;
}

function nearestContext(frac: number): ContextWindow {
  const stops: [number, ContextWindow][] = CONTEXT_OPTIONS.map((c) => [contextFraction(c), c]);
  let best = stops[0];
  let bestDelta = Math.abs(stops[0][0] - frac);
  for (const s of stops) {
    const d = Math.abs(s[0] - frac);
    if (d < bestDelta) { best = s; bestDelta = d; }
  }
  return best[1];
}

function fmtContext(c: ContextWindow): string {
  if (c >= 1_000_000) return '1,000,000 tokens';
  return `${c.toLocaleString('en-US')} tokens`;
}

/** 14 — agent / model drilldown. */
export function SettingsModel({ navigation }: Props) {
  const settings = useSettings();
  const a = settings.agent;
  const [prompt, setPrompt] = useState(a.systemPrompt);

  useEffect(() => { setPrompt(a.systemPrompt); }, [a.systemPrompt]);

  const tokenEstimate = useMemo(() => Math.round(prompt.length / 4) + 6000, [prompt]);
  const cost = (tokenEstimate * 0.000003).toFixed(3);

  return (
    <Screen>
      <TermAppBar title="~/settings/agent" chip="EDIT" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.crumb}>
          <Pressable onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.crumbDim}>settings ›</Text>
          </Pressable>
          <Text style={[styles.crumbCur, { color: colors.rose }]}>[agent]</Text>
        </View>

        <Text style={styles.sec}>// MODEL · routed via [providers]</Text>
        <View style={styles.modelList}>
          {MODELS.map((m) => {
            const sel = a.model === m.id;
            const linked = isLinked(m.via, settings);
            const tone = toneColor(m.tone);
            return (
              <Pressable
                key={m.id}
                onPress={() => settings.setAgent('model', m.id)}
                style={[styles.modelRow, { borderColor: sel ? tone : colors.glassBorder, opacity: linked ? 1 : 0.7 }]}
              >
                <Text style={[styles.radio, { color: sel ? tone : colors.textLo }]}>{sel ? '◉' : '○'}</Text>
                <View style={styles.flex}>
                  <Text style={styles.modelName}>
                    <Text style={{ color: sel ? colors.textHi : colors.textMid }}>{m.id}</Text>
                    <Text style={styles.note}>  · {m.note}</Text>
                  </Text>
                  <View style={styles.viaRow}>
                    <Text style={styles.viaDim}>via </Text>
                    <Text style={{ color: linked ? colors.cyan : colors.textLo, fontFamily: fonts.monoFallback, fontSize: 8.5 }}>{m.via}</Text>
                    <Text style={[styles.keyPill, { color: linked ? colors.mint : colors.rose, borderColor: linked ? 'rgba(94,255,178,0.5)' : 'rgba(255,138,180,0.5)' }]}>
                      {linked ? 'KEY ✓' : 'NEEDS KEY'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={() => navigation.navigate('SettingsProviders')}>
          <Text style={styles.linkNote}>→ add or test keys in <Text style={{ color: colors.cyan }}>:settings providers</Text></Text>
        </Pressable>

        <Text style={styles.sec}>// CONTEXT</Text>
        <View style={styles.kv}>
          <Text style={styles.kvKey}>window</Text>
          <Text style={{ color: colors.cyan, fontFamily: fonts.monoFallback, fontSize: 11 }}>{fmtContext(a.contextWindow)}</Text>
        </View>
        <TermBar value={contextFraction(a.contextWindow)} max={20} color="cyan" onChange={(f) => settings.setAgent('contextWindow', nearestContext(f))} />
        <View style={styles.stops}>
          {CONTEXT_OPTIONS.map((c) => (
            <Pressable key={c} onPress={() => settings.setAgent('contextWindow', c)}>
              <Text style={{ color: a.contextWindow === c ? colors.cyan : colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9 }}>
                {c === 1_000_000 ? '1M' : `${c / 1000}K`}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sec}>// THINKING</Text>
        <View style={[styles.card, { borderColor: 'rgba(139,111,255,0.3)', backgroundColor: 'rgba(139,111,255,0.05)' }]}>
          <View style={styles.kv}>
            <Text style={styles.kvKey}>budget</Text>
            <Stepper value={a.thinking} options={THINKING_OPTIONS} color="violet" onChange={(v) => settings.setAgent('thinking', v as Thinking)} />
          </View>
          <Text style={styles.cardNote}>off · think · think-hard · think-harder{'\n'}→ up to 32K reasoning tokens before each turn</Text>
        </View>

        <View style={styles.tempHead}>
          <View>
            <Text style={styles.sec}>// TEMPERATURE</Text>
            <Text style={styles.kvKey}>creativity</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: colors.rose, fontFamily: fonts.monoFallback }}>{a.temperature.toFixed(2)}</Text>
            <Text style={styles.note}>precise → wild</Text>
          </View>
        </View>
        <TermBar value={a.temperature} max={20} color="rose" onChange={(f) => settings.setAgent('temperature', Math.round(f * 100) / 100)} />

        <Text style={styles.sec}>// SAFETY</Text>
        <SafetyRow label="auto-approve diffs" color="rose" on={a.autoApprove} onChange={(v) => settings.setAgent('autoApprove', v)} />
        <SafetyRow label="verify before ship" color="mint" on={a.verifyBeforeShip} onChange={(v) => settings.setAgent('verifyBeforeShip', v)} />
        <SafetyRow label="allow shell exec" color="mint" on={a.allowShellExec} onChange={(v) => settings.setAgent('allowShellExec', v)} />

        <Text style={styles.sec}>// SYSTEM PROMPT</Text>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          onBlur={() => settings.setAgent('systemPrompt', prompt)}
          multiline
          style={styles.textarea}
          placeholderTextColor={colors.textLo}
        />

        <View style={styles.estimate}>
          <Text style={styles.note}>est · cost per turn</Text>
          <Text style={{ color: colors.mint, fontFamily: fonts.monoFallback, fontSize: 10 }}>
            ~{tokenEstimate.toLocaleString('en-US')} tok · ${cost}
          </Text>
        </View>
      </ScrollView>
      <VimBar mode="NORMAL" cmd=":w settings/agent" hint="tap to edit" />
    </Screen>
  );
}

function SafetyRow({ label, on, color, onChange }: { label: string; on: boolean; color: Tone; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.kvKey}>{label}</Text>
      <Toggle on={on} color={color} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 14, paddingBottom: 28 },
  flex: { flex: 1, minWidth: 0 },
  crumb: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  crumbDim: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 10 },
  crumbCur: { fontFamily: fonts.monoFallback, fontSize: 10, fontWeight: '600' },
  sec: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5, letterSpacing: 0.6, marginTop: 14 },
  modelList: { gap: 4, marginTop: 6 },
  modelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 6, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  radio: { width: 12, fontFamily: fonts.monoFallback, fontSize: 11 },
  modelName: { fontFamily: fonts.monoFallback, fontSize: 11 },
  note: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9 },
  viaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  viaDim: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 8.5 },
  keyPill: { fontFamily: fonts.monoFallback, fontSize: 8, fontWeight: '700', letterSpacing: 0.5, borderWidth: 1, paddingHorizontal: 4 },
  linkNote: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5, marginTop: 4 },
  kv: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  kvKey: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 11 },
  stops: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  card: { marginTop: 6, padding: 8, borderWidth: 1 },
  cardNote: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5, marginTop: 6, lineHeight: 14 },
  tempHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  textarea: {
    marginTop: 4,
    minHeight: 96,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: 'rgba(0,0,0,0.4)',
    color: colors.textMid,
    fontFamily: fonts.monoFallback,
    fontSize: 10,
    lineHeight: 15,
    textAlignVertical: 'top',
  },
  estimate: {
    marginTop: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(94,255,178,0.3)',
    borderStyle: 'dashed',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
