import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { TermAppBar } from '@/components/TermAppBar';
import { VimBar } from '@/components/form/VimBar';
import { colors, fonts, toneColor, type Tone } from '@/theme/tokens';
import { useSettings, type SettingsShape } from '@/lib/settings-store';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

type Route = 'SettingsModel' | 'SettingsProviders' | 'Account';

interface Section {
  key: string;
  tone: Tone;
  route?: Route;
  badge?: string;
  summary: (s: SettingsShape) => string;
}

function humanContext(c: number): string {
  if (c >= 1_000_000) return '1M';
  if (c >= 1000) return `${Math.round(c / 1000)}K`;
  return String(c);
}

function countLinked(s: SettingsShape): number {
  let n = 0;
  if (s.providers.anthropicKey) n++;
  if (s.providers.openaiKey) n++;
  if (s.providers.googleKey) n++;
  if (s.providers.ollamaUrl) n++;
  n++; // lucid-cloud always counts
  return n;
}

const SECTIONS: Section[] = [
  { key: 'agent', tone: 'rose', route: 'SettingsModel', summary: (s) => `${s.agent.model} · ${humanContext(s.agent.contextWindow)} · ${s.agent.thinking}` },
  { key: 'providers', tone: 'cyan', route: 'SettingsProviders', badge: 'NEW', summary: (s) => { const l = countLinked(s); return `${l} linked · ${6 - l} empty · BYOK + lucid cloud`; } },
  { key: 'voice', tone: 'cyan', summary: (s) => `${s.voice.stt} · ${s.voice.hotkey} · vad ${s.voice.vad}` },
  { key: 'approvals', tone: 'violet', summary: (s) => `${s.agent.autoApprove ? 'auto-approve' : 'manual diffs'} · ${s.agent.verifyBeforeShip ? 'verify before ship' : 'no verify'}` },
  { key: 'memory', tone: 'mint', summary: () => 'project + global · 142 turns kept' },
  { key: 'tools', tone: 'cyan', summary: () => 'bash · pnpm · vite · vercel' },
  { key: 'integrations', tone: 'mint', summary: () => 'github · vercel · supabase · 1 off' },
  { key: 'theme', tone: 'rose', summary: (s) => `${s.ui.theme} · ${s.ui.density} · ${s.ui.scanlines ? 'scanlines' : 'flat'}` },
  { key: 'workspace', tone: 'violet', summary: () => 'idea-garden · main · .gitignore' },
  { key: 'account', tone: 'cyan', route: 'Account', summary: () => 'iris@hey.com · pro · 142h used' },
  { key: 'danger', tone: 'rose', summary: () => 'reset · clear cache · sign out' },
];

/** 12 — settings hub. Sectioned list; tap a routed row to drill in. */
export function SettingsScreen({ navigation }: Props) {
  const settings = useSettings();

  return (
    <Screen>
      <TermAppBar title="~/settings" chip="CONF" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.headRow}>
          <Text style={styles.head}>:Settings</Text>
          <Text style={styles.dim}>{SECTIONS.length} sections</Text>
        </View>
        <Text style={styles.sub}>// ~/.lucidrc · live</Text>

        <View style={styles.list}>
          {SECTIONS.map((s) => {
            const routed = !!s.route;
            return (
              <Pressable
                key={s.key}
                disabled={!routed}
                onPress={() => s.route && navigation.navigate(s.route)}
                style={({ pressed }) => [styles.row, pressed && routed && styles.rowPressed]}
              >
                <View style={styles.rowMain}>
                  <View style={styles.keyLine}>
                    <Text style={[styles.key, { color: toneColor(s.tone) }]}>[{s.key}]</Text>
                    {s.badge ? <Text style={styles.badge}>{s.badge}</Text> : null}
                  </View>
                  <Text style={styles.summary} numberOfLines={1}>{s.summary(settings)}</Text>
                </View>
                {routed ? <Text style={styles.chev}>→</Text> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Pressable onPress={() => navigation.navigate('SettingsRaw')}>
            <Text style={styles.footerLine}>
              <Text style={styles.cyan}>:e</Text> edit raw .lucidrc
            </Text>
          </Pressable>
          <Pressable onPress={() => settings.reset()}>
            <Text style={styles.footerLine}>
              <Text style={styles.rose}>:reset</Text> revert to defaults
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <VimBar mode="NORMAL" cmd=":settings" hint="enter · :e raw · :reset" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 14, paddingBottom: 24 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  head: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 13, fontWeight: '600' },
  sub: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5, marginTop: 2, marginBottom: 8 },
  dim: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  list: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  rowPressed: { backgroundColor: 'rgba(255,138,180,0.06)', borderLeftColor: colors.rose },
  rowMain: { flex: 1, gap: 1 },
  keyLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  key: { fontFamily: fonts.monoFallback, fontSize: 11.5, fontWeight: '600' },
  badge: {
    fontFamily: fonts.monoFallback,
    fontSize: 8.5,
    letterSpacing: 0.6,
    color: '#000',
    backgroundColor: colors.mint,
    paddingHorizontal: 4,
    fontWeight: '700',
  },
  summary: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 10 },
  chev: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 12 },
  footer: {
    marginTop: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    gap: 4,
  },
  footerLine: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5 },
  cyan: { color: colors.cyan },
  rose: { color: colors.rose },
});
