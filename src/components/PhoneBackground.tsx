import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {
  Defs,
  Pattern,
  Path,
  Rect,
  RadialGradient,
  Stop,
} from 'react-native-svg';

/**
 * Edge-to-edge terminal canvas — the RN translation of the web `TermPhone`
 * chrome. Layers, back to front: dark vertical gradient, faint 16px grid, and a
 * single rose ember glow in the top-right. No simulated status bar / notch /
 * home indicator — the OS draws the real ones.
 */
export function PhoneBackground() {
  return (
    <LinearGradient
      colors={['#08070f', '#050409']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <Pattern
            id="grid"
            width={16}
            height={16}
            patternUnits="userSpaceOnUse"
          >
            <Path
              d="M16 0 H0 V16"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth={1}
            />
          </Pattern>
          <RadialGradient id="ember" cx="85%" cy="8%" r="45%">
            <Stop offset="0" stopColor="#FF6B9D" stopOpacity={0.22} />
            <Stop offset="0.7" stopColor="#FF6B9D" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#grid)" />
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#ember)" />
      </Svg>
    </LinearGradient>
  );
}
