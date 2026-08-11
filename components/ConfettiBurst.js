import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const PIECE_COUNT = 16;

function ConfettiPiece({ color }) {
  const [leftPercent] = useState(() => 5 + Math.random() * 90);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const dx = (Math.random() - 0.5) * 140;
    const dy = 160 + Math.random() * 160;
    const spin = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360);
    const duration = 900 + Math.random() * 400;

    translateX.value = withTiming(dx, { duration, easing: Easing.out(Easing.quad) });
    translateY.value = withTiming(dy, { duration, easing: Easing.out(Easing.quad) });
    rotate.value = withTiming(spin, { duration });
    opacity.value = withDelay(duration * 0.6, withTiming(0, { duration: duration * 0.4 }));
    // Randomized once per mount — this component is only rendered fresh on a win.
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[styles.piece, animatedStyle, { backgroundColor: color, left: `${leftPercent}%` }]}
    />
  );
}

export default function ConfettiBurst() {
  const { theme } = useTheme();
  const colors = [theme.primary, theme.accent, theme.danger, theme.surface];

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: PIECE_COUNT }).map((_, i) => (
        <ConfettiPiece key={i} color={colors[i % colors.length]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  piece: {
    position: 'absolute',
    top: 0,
    width: 8,
    height: 12,
    borderRadius: 2,
  },
});
