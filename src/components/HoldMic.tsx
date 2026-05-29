import React, { useMemo, useRef } from 'react';
import { View, Text, PanResponder, StyleSheet } from 'react-native';
import { IconMic } from './icons';
import { colors, fonts } from '@/theme/tokens';
import { useVoice } from '@/lib/useVoice';

interface Props {
  /** True while the active session is recording. */
  recording: boolean;
  elapsed: number;
  /** Compact pill variant for the landscape right edge. */
  compact?: boolean;
}

/**
 * Press-and-hold mic. Built on the built-in PanResponder (no gesture-handler):
 * press to start, release to send, drag up past a threshold to cancel — the
 * "slide to cancel" affordance from the design's listening screen.
 */
export function HoldMic({ recording, elapsed, compact }: Props) {
  const { start, stop, cancel } = useVoice();
  const willCancel = useRef(false);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          willCancel.current = false;
          start();
        },
        onPanResponderMove: (_e, g) => {
          willCancel.current = g.dy < -70;
        },
        onPanResponderRelease: () => {
          if (willCancel.current) cancel();
          else stop();
        },
        onPanResponderTerminate: () => cancel(),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const label = recording
    ? (willCancel.current ? 'RELEASE TO CANCEL' : `HOLD · ${elapsed.toFixed(0)}s`)
    : 'HOLD TO TALK';

  return (
    <View
      {...responder.panHandlers}
      style={[styles.btn, compact && styles.compact, recording && styles.btnRec]}
    >
      <IconMic size={compact ? 16 : 18} stroke={recording ? colors.rose : colors.textHi} sw={1.8} />
      {!compact && <Text style={[styles.label, recording && styles.labelRec]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.glassBorderBright,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  compact: { paddingVertical: 9, paddingHorizontal: 10 },
  btnRec: { borderColor: colors.rose, backgroundColor: 'rgba(255,138,180,0.12)' },
  label: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 12, letterSpacing: 0.8 },
  labelRec: { color: colors.rose },
});
