import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { TermAppBar } from '@/components/TermAppBar';
import { HoldMic } from '@/components/HoldMic';
import { ListeningOverlay } from '@/components/ListeningOverlay';
import { LandSessionScreen } from './LandSessionScreen';
import { colors, fonts } from '@/theme/tokens';
import { useActiveSession, useSessions } from '@/lib/store';
import { useOrientation } from '@/lib/useOrientation';
import { toneColor, type AgentTurn, type Turn } from '@/lib/types';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'Session'>;

const PLAN_MARK = { done: '[/]', running: '[●]', pending: '[ ]' } as const;

export function SessionScreen(_props: Props) {
  const orientation = useOrientation();
  const session = useActiveSession();
  const submitTextTurn = useSessions((s) => s.submitTextTurn);
  const approveLatestPlan = useSessions((s) => s.approveLatestPlan);
  const [draft, setDraft] = useState('');

  // Landscape unlocks the tmux-style 3-pane layout; both read the same session.
  if (orientation === 'landscape') return <LandSessionScreen />;

  if (!session) {
    return (
      <Screen>
        <TermAppBar title="session" />
        <View style={styles.empty}>
          <Text style={styles.dim}>no active session — pick a repo first</Text>
        </View>
      </Screen>
    );
  }

  const awaitingApproval = session.state === 'PLAN';
  const recording = session.state === 'REC';

  return (
    <Screen>
      <TermAppBar title={session.name} chip={session.state} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.flex}>
          <ScrollView contentContainerStyle={styles.feed}>
            {session.turns.map((t) => (
              <TurnView key={t.id} turn={t} />
            ))}
          </ScrollView>
          {recording && <ListeningOverlay elapsed={session.recElapsed} interim={session.interim} />}
        </View>

        {awaitingApproval && (
          <Pressable
            onPress={() => approveLatestPlan(session.id)}
            style={({ pressed }) => [styles.approve, pressed && styles.approvePressed]}
          >
            <Text style={styles.approveText}>[A] APPROVE PLAN</Text>
          </Pressable>
        )}

        <View style={styles.inputBar}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="type a turn…"
            placeholderTextColor={colors.textLo}
            style={styles.input}
            onSubmitEditing={() => {
              submitTextTurn(session.id, draft);
              setDraft('');
            }}
            returnKeyType="send"
          />
          <HoldMic recording={recording} elapsed={session.recElapsed} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function TurnView({ turn }: { turn: Turn }) {
  if (turn.kind === 'user') {
    return (
      <View style={styles.turn}>
        <Text style={styles.userText}>{'> '}{turn.text}</Text>
        {turn.voice && (
          <Text style={styles.voiceChip}>
            voice{turn.duration ? ` · 0:${String(Math.round(turn.duration)).padStart(2, '0')}` : ''}
          </Text>
        )}
      </View>
    );
  }
  return <AgentTurnView turn={turn} />;
}

function AgentTurnView({ turn }: { turn: AgentTurn }) {
  return (
    <View style={styles.turn}>
      {turn.plan.map((p) => (
        <Text key={p.id} style={styles.planItem}>
          <Text style={{ color: toneColor(p.status === 'done' ? 'mint' : p.status === 'running' ? 'amber' : 'lo') }}>
            {PLAN_MARK[p.status]}
          </Text>{' '}
          {p.label}
          {p.comment ? <Text style={styles.dim}>  {p.comment}</Text> : null}
        </Text>
      ))}
      {turn.log.map((l, i) => (
        <Text key={i} style={[styles.log, l.tone ? { color: toneColor(l.tone) } : null]}>
          {l.prefix ? `${l.prefix} ` : ''}
          {l.text}
        </Text>
      ))}
      {turn.diff && (
        <Text style={styles.diff}>
          ~ {turn.diff.path}  <Text style={{ color: colors.mint }}>+{turn.diff.added}</Text>{' '}
          <Text style={{ color: colors.rose }}>-{turn.diff.removed}</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dim: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 12 },
  feed: { padding: 12, gap: 12 },
  turn: { gap: 3 },
  userText: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 13 },
  voiceChip: { color: colors.cyan, fontFamily: fonts.monoFallback, fontSize: 9.5, marginTop: 1 },
  planItem: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 12.5, lineHeight: 19 },
  log: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 12, lineHeight: 18 },
  diff: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 12, marginTop: 2 },
  approve: {
    marginHorizontal: 12,
    marginBottom: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.mint,
  },
  approvePressed: { backgroundColor: 'rgba(94,255,178,0.10)' },
  approveText: { color: colors.mint, fontFamily: fonts.monoFallback, fontSize: 13, letterSpacing: 0.8 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glassBorder,
    padding: 10,
  },
  input: {
    flex: 1,
    color: colors.textHi,
    fontFamily: fonts.monoFallback,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.bgElev1,
  },
});
