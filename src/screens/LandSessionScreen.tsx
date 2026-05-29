import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, ScrollView, PanResponder, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { Screen } from '@/components/Screen';
import { TermAppBar } from '@/components/TermAppBar';
import { HoldMic } from '@/components/HoldMic';
import { ListeningOverlay } from '@/components/ListeningOverlay';
import { colors, fonts, toneColor } from '@/theme/tokens';
import { useActiveSession, useSessions } from '@/lib/store';
import type { AgentTurn } from '@/lib/types';

const PLAN_MARK = { done: '[/]', running: '[●]', pending: '[ ]' } as const;
const MIN = 0.16;

/**
 * 09 — landscape session, tmux-style: `PLAN │ CODE │ PREVIEW` with draggable
 * splitters (built-in PanResponder, no gesture-handler). App bar + bottom bar
 * span full width; the HOLD mic is anchored bottom-right.
 */
export function LandSessionScreen() {
  const session = useActiveSession();
  const submitTextTurn = useSessions((s) => s.submitTextTurn);
  const [draft, setDraft] = useState('');
  const [widths, setWidths] = useState<[number, number, number]>([0.28, 0.38, 0.34]);
  const totalRef = useRef(0);

  const agent = useMemo<AgentTurn | null>(() => {
    if (!session) return null;
    for (let i = session.turns.length - 1; i >= 0; i--) {
      const t = session.turns[i];
      if (t.kind === 'agent') return t;
    }
    return null;
  }, [session]);

  if (!session) {
    return (
      <Screen>
        <TermAppBar title="session" />
        <View style={styles.empty}><Text style={styles.dim}>no active session — pick a repo first</Text></View>
      </Screen>
    );
  }

  const recording = session.state === 'REC';

  const onLayout = (e: LayoutChangeEvent) => { totalRef.current = e.nativeEvent.layout.width; };

  // Divider `idx` (0 or 1) moves width between pane idx and idx+1.
  const dragger = (idx: number) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_e, g) => {
        const total = totalRef.current;
        if (!total) return;
        const delta = g.dx / total;
        setWidths((w) => {
          const next: [number, number, number] = [...w];
          const a = w[idx] + delta;
          const b = w[idx + 1] - delta;
          if (a < MIN || b < MIN) return w;
          next[idx] = a;
          next[idx + 1] = b;
          return next;
        });
      },
    });

  return (
    <Screen>
      <TermAppBar title={`~/${session.repo.name} · ⌥ ${session.branch}`} chip={session.state} />

      <View style={styles.panes} onLayout={onLayout}>
        {/* PLAN */}
        <View style={[styles.pane, { flex: widths[0] }]}>
          <Text style={styles.paneTitle}>PLAN</Text>
          <ScrollView contentContainerStyle={styles.paneBody}>
            {agent?.plan.length ? agent.plan.map((p) => (
              <Text key={p.id} style={styles.planItem}>
                <Text style={{ color: toneColor(p.status === 'done' ? 'mint' : p.status === 'running' ? 'amber' : 'lo') }}>{PLAN_MARK[p.status]}</Text>
                {' '}{p.label}
              </Text>
            )) : <Text style={styles.dim}>no plan yet</Text>}
          </ScrollView>
        </View>

        <Divider responder={dragger(0)} />

        {/* CODE */}
        <View style={[styles.pane, { flex: widths[1] }]}>
          <Text style={styles.paneTitle}>CODE</Text>
          <ScrollView contentContainerStyle={styles.paneBody}>
            {agent?.diff && (
              <Text style={styles.diff}>~ {agent.diff.path}  <Text style={{ color: colors.mint }}>+{agent.diff.added}</Text> <Text style={{ color: colors.rose }}>-{agent.diff.removed}</Text></Text>
            )}
            {agent?.log.map((l, i) => (
              <Text key={i} style={[styles.log, l.tone ? { color: toneColor(l.tone) } : null]}>{l.prefix ? `${l.prefix} ` : ''}{l.text}</Text>
            ))}
            {!agent?.diff && !agent?.log.length && <Text style={styles.dim}>no changes yet</Text>}
          </ScrollView>
        </View>

        <Divider responder={dragger(1)} />

        {/* PREVIEW */}
        <View style={[styles.pane, { flex: widths[2] }]}>
          <Text style={styles.paneTitle}>PREVIEW</Text>
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>localhost:5173</Text>
            <Text style={styles.dim}>· HMR · live</Text>
          </View>
        </View>
      </View>

      {/* bottom bar */}
      <View style={styles.bottomBar}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="type a turn…"
          placeholderTextColor={colors.textLo}
          style={styles.input}
          onSubmitEditing={() => { submitTextTurn(session.id, draft); setDraft(''); }}
          returnKeyType="send"
        />
        <HoldMic recording={recording} elapsed={session.recElapsed} compact />
      </View>

      {recording && <ListeningOverlay elapsed={session.recElapsed} interim={session.interim} />}
    </Screen>
  );
}

function Divider({ responder }: { responder: ReturnType<typeof PanResponder.create> }) {
  return (
    <View {...responder.panHandlers} style={styles.divider} hitSlop={{ left: 8, right: 8 }}>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dim: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 11 },
  panes: { flex: 1, flexDirection: 'row' },
  pane: { paddingHorizontal: 8, paddingTop: 6 },
  paneTitle: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9, letterSpacing: 1.2, marginBottom: 4 },
  paneBody: { paddingBottom: 12, gap: 3 },
  planItem: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 11, lineHeight: 17 },
  diff: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 10.5, marginBottom: 4 },
  log: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 10.5, lineHeight: 16 },
  previewBox: { flex: 1, borderWidth: 1, borderColor: colors.glassBorder, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  previewLabel: { color: colors.mint, fontFamily: fonts.monoFallback, fontSize: 10 },
  divider: { width: 9, alignItems: 'center', justifyContent: 'center' },
  dividerLine: { width: 1, height: '70%', backgroundColor: colors.glassBorderBright },
  bottomBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.glassBorder },
  input: { flex: 1, color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 12, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: colors.glassBorder, backgroundColor: colors.bgElev1 },
});
