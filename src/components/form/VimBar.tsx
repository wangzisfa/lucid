import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/theme/tokens';

type Mode = 'NORMAL' | 'INSERT' | 'VOICE' | 'VISUAL';

const MODE_COLOR: Record<Mode, string> = {
  NORMAL: colors.mint,
  INSERT: colors.cyan,
  VOICE: colors.rose,
  VISUAL: colors.amber,
};

interface Props {
  mode: Mode;
  cmd: string;
  hint?: string;
}

/**
 * Vim-style status line pinned to the bottom of a settings screen — the RN
 * translation of the web `VimBar`. Mode chip (color-coded) · command · hint.
 */
export function VimBar({ mode, cmd, hint }: Props) {
  return (
    <View style={styles.bar}>
      <View style={[styles.mode, { backgroundColor: MODE_COLOR[mode] }]}>
        <Text style={styles.modeText}>{mode}</Text>
      </View>
      <Text style={styles.cmd} numberOfLines={1}>
        {cmd}
      </Text>
      {hint ? (
        <Text style={styles.hint} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glassBorder,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  mode: { paddingHorizontal: 6, paddingVertical: 2 },
  modeText: {
    color: '#07060f',
    fontFamily: fonts.monoFallback,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cmd: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 11 },
  hint: {
    marginLeft: 'auto',
    color: colors.textLo,
    fontFamily: fonts.monoFallback,
    fontSize: 9.5,
  },
});
