import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PhoneBackground } from './PhoneBackground';
import { colors } from '@/theme/tokens';

interface ScreenProps {
  children: React.ReactNode;
  /** Extra style for the safe-area content wrapper. */
  style?: ViewStyle;
  /** Pad the content by the safe-area insets (default true). */
  inset?: boolean;
}

/**
 * Fullscreen screen container: the terminal canvas behind, content inset by the
 * real OS safe area in front. Every route renders inside one of these — there
 * is no centered "phone card" anymore; the app is edge-to-edge.
 */
export function Screen({ children, style, inset = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgDeep }}>
      <PhoneBackground />
      <View
        style={[
          {
            flex: 1,
            paddingTop: inset ? insets.top : 0,
            paddingBottom: inset ? insets.bottom : 0,
            paddingLeft: inset ? insets.left : 0,
            paddingRight: inset ? insets.right : 0,
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}
