import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IconChevL, IconMenu } from './icons';
import { GlobalMenu } from './GlobalMenu';
import { colors, fonts } from '@/theme/tokens';
import { chipTone, toneColor, type SessionChipState } from '@/lib/types';

interface Props {
  title: string;
  chip?: SessionChipState;
  /** Hide the back button (entry screens). */
  hideBack?: boolean;
}

/**
 * Top app bar. The left slot carries a back chevron (mirrors the OS back — the
 * real back affordance is the native swipe gesture) and a menu hamburger that
 * opens the `GlobalMenu` sheet. Because every screen renders this bar, every
 * screen can reach session / agents / files / settings.
 */
export function TermAppBar({ title, chip, hideBack }: Props) {
  const navigation = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const canGoBack = !hideBack && navigation.canGoBack();

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        {canGoBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="back"
            onPress={() => navigation.goBack()}
            hitSlop={10}
            style={styles.btn}
          >
            <IconChevL size={14} stroke={colors.textMid} sw={2} />
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="menu"
          onPress={() => setMenuOpen(true)}
          hitSlop={10}
          style={styles.btn}
        >
          <IconMenu size={14} stroke={colors.textMid} sw={2} />
        </Pressable>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.right}>
        {chip && (
          <Text style={[styles.chip, { color: toneColor(chipTone(chip)) }]}>
            {chip}
          </Text>
        )}
      </View>

      <GlobalMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 28 },
  right: { minWidth: 28, alignItems: 'flex-end' },
  btn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  title: {
    flex: 1,
    color: colors.textHi,
    fontFamily: fonts.monoFallback,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  chip: { fontFamily: fonts.monoFallback, fontSize: 11, letterSpacing: 0.6 },
});
