import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlockWave } from './BlockWave';
import { colors, fonts } from '@/theme/tokens';

interface Props {
  elapsed: number;
  interim: string;
}

function fmt(elapsed: number): string {
  const m = Math.floor(elapsed / 60);
  const s = Math.floor(elapsed % 60);
  const tenths = Math.floor((elapsed * 10) % 10);
  return `${m}:${String(s).padStart(2, '0')}.${tenths}`;
}

/**
 * 06 — hold-to-record hero. Covers the feed while the mic is held: a big rose
 * RECORDING label + timer, the live transcript in serif italic, and the block
 * waveform. The HOLD button itself lives in the bottom bar (the user's finger
 * is on it); releasing or dragging up there ends/cancels the take.
 */
export function ListeningOverlay({ elapsed, interim }: Props) {
  return (
    <View style={styles.fill}>
      <View style={styles.head}>
        <View style={styles.dot} />
        <Text style={styles.rec}>RECORDING</Text>
        <Text style={styles.timer}>{fmt(elapsed)}</Text>
      </View>

      <Text style={styles.transcript}>
        {interim ? `“${interim}”` : 'listening…'}
      </Text>

      <View style={styles.waveWrap}>
        <BlockWave bars={32} color="rose" active height={56} />
      </View>

      <Text style={styles.hint}>release to send · slide up to cancel</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,6,15,0.92)', padding: 22, justifyContent: 'center', gap: 18 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.rose },
  rec: { color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 14, letterSpacing: 2, fontWeight: '700' },
  timer: { marginLeft: 'auto', color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 16 },
  transcript: { color: colors.textHi, fontFamily: fonts.display, fontStyle: 'italic', fontSize: 24, lineHeight: 32 },
  waveWrap: { height: 56 },
  hint: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 10, textAlign: 'center' },
});
