import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IconClose } from './icons';
import { colors, fonts } from '@/theme/tokens';
import { useSessions, useLiveCount, useSessionList } from '@/lib/store';
import type { RootStackParamList } from '@/navigation/RootStack';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Dest = keyof RootStackParamList;

interface Item {
  label: string;
  dest: Dest;
  hotkey: string;
  hint: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * Slide-up navigation sheet — the RN translation of the web `GlobalMenuSheet`.
 * Lists the canonical destinations (session / agents / files / settings) plus a
 * reset action. Opened from the hamburger in `TermAppBar`, so every screen with
 * an app bar can reach every other screen.
 */
export function GlobalMenu({ visible, onClose }: Props) {
  const navigation = useNavigation<Nav>();
  const liveCount = useLiveCount();
  const sessions = useSessionList();
  const resetAll = useSessions((s) => s.resetAll);

  const items: Item[] = [
    {
      label: 'session',
      dest: 'Session',
      hotkey: 's',
      hint: sessions.length > 0 ? sessions[sessions.length - 1].name : 'empty',
    },
    {
      label: 'agents',
      dest: 'Agents',
      hotkey: 'a',
      hint: `${sessions.length} session${sessions.length === 1 ? '' : 's'}`,
    },
    { label: 'files', dest: 'Files', hotkey: 'f', hint: 'vim-style tree' },
    { label: 'settings', dest: 'Settings', hotkey: ',', hint: '.lucidrc' },
  ];

  const pick = (dest: Dest) => {
    onClose();
    navigation.navigate(dest as never);
  };

  const onReset = () => {
    Alert.alert('Reset all sessions?', 'This cannot be undone.', [
      { text: 'cancel', style: 'cancel' },
      {
        text: 'reset',
        style: 'destructive',
        onPress: () => {
          resetAll();
          onClose();
          navigation.navigate('Boot' as never);
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>// MENU</Text>
            <Pressable accessibilityLabel="close menu" onPress={onClose} hitSlop={8}>
              <IconClose size={12} stroke={colors.textMid} />
            </Pressable>
          </View>

          {items.map((it) => (
            <Pressable
              key={it.label}
              onPress={() => pick(it.dest)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <Text style={styles.hotkey}>{it.hotkey}</Text>
              <Text style={styles.label}>[{it.label}]</Text>
              <Text style={styles.hint} numberOfLines={1}>
                {it.hint}
              </Text>
              {it.label === 'agents' && liveCount > 0 ? (
                <Text style={styles.badge}>{liveCount} LIVE</Text>
              ) : null}
            </Pressable>
          ))}

          <View style={styles.footer}>
            <Pressable onPress={onReset} style={styles.reset} hitSlop={6}>
              <Text style={styles.resetText}>:reset</Text>
            </Pressable>
            <Text style={styles.footerHint}>tap outside to close</Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7,6,15,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    margin: 12,
    marginBottom: 26,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderWidth: 1,
    borderColor: colors.glassBorderBright,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
  },
  headerTitle: {
    color: colors.rose,
    fontFamily: fonts.monoFallback,
    fontSize: 10.5,
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  rowPressed: {
    backgroundColor: 'rgba(255,138,180,0.08)',
    borderLeftColor: colors.rose,
  },
  hotkey: {
    width: 18,
    textAlign: 'center',
    color: colors.textLo,
    fontFamily: fonts.monoFallback,
    fontSize: 10,
    borderWidth: 1,
    borderColor: colors.glassBorderBright,
    paddingVertical: 1,
  },
  label: {
    minWidth: 78,
    color: colors.textHi,
    fontFamily: fonts.monoFallback,
    fontSize: 12,
  },
  hint: { flex: 1, color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 10 },
  badge: {
    color: colors.mint,
    fontFamily: fonts.monoFallback,
    fontSize: 9.5,
    borderWidth: 1,
    borderColor: 'rgba(94,255,178,0.4)',
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glassBorder,
  },
  reset: {
    borderWidth: 1,
    borderColor: 'rgba(255,138,180,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  resetText: { color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 10.5, letterSpacing: 0.6 },
  footerHint: { marginLeft: 'auto', color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 9.5 },
});
