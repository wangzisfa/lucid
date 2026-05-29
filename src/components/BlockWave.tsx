import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Easing } from 'react-native';
import { colors, toneColor, type Tone } from '@/theme/tokens';

interface Props {
  bars?: number;
  color?: Tone;
  /** Animate the bars (true while recording). */
  active?: boolean;
  height?: number;
}

/**
 * Block waveform — the RN translation of the web `<BlockWave>`. A row of mono
 * bars that breathe while recording. Decorative; no audio analysis.
 */
export function BlockWave({ bars = 28, color = 'rose', active = true, height = 40 }: Props) {
  const tint = toneColor(color);
  const values = useRef(Array.from({ length: bars }, () => new Animated.Value(0.3))).current;

  useEffect(() => {
    if (!active) {
      values.forEach((v) => v.setValue(0.25));
      return;
    }
    const loops = values.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 0.4 + ((i * 37) % 60) / 100,
            duration: 260 + (i % 5) * 70,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(v, {
            toValue: 0.2,
            duration: 240 + (i % 4) * 60,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active, values]);

  return (
    <View style={[styles.row, { height }]}>
      {values.map((v, i) => (
        <Animated.View
          key={i}
          style={{
            flex: 1,
            marginHorizontal: 1,
            backgroundColor: tint,
            opacity: active ? 0.85 : 0.4,
            height: v.interpolate({ inputRange: [0, 1], outputRange: [3, height] }),
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'transparent' },
});

export { colors };
