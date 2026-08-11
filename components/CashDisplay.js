import React, { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { MISC_ICONS, AppIcon } from '../constants/icons';

const COUNT_DURATION_MS = 500;
const COUNT_STEP_MS = 25;

export default function CashDisplay({ value, style, textStyle }) {
  const { theme, spacing, typeScale } = useTheme();
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);
  const scale = useSharedValue(1);
  const bounceY = useSharedValue(0);
  const coinRotate = useSharedValue(0);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;
    if (from === to) return;

    scale.value = withSequence(withTiming(1.12, { duration: 150 }), withTiming(1, { duration: 250 }));
    bounceY.value = withSequence(
      withTiming(-8, { duration: 140, easing: Easing.out(Easing.quad) }),
      withSpring(0, { damping: 6, stiffness: 260 })
    );
    coinRotate.value = 0;
    coinRotate.value = withTiming(360, { duration: 500, easing: Easing.out(Easing.cubic) });

    // Timer-driven (not requestAnimationFrame-driven): this component can be off-screen
    // (e.g. the Home tab while another tab is active), and browsers don't reliably run
    // rAF callbacks for content that isn't currently being painted.
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / COUNT_DURATION_MS);
      setDisplayValue(Math.round(from + (to - from) * t));
      if (t >= 1) {
        clearInterval(intervalId);
      }
    }, COUNT_STEP_MS);
    return () => clearInterval(intervalId);
  }, [value, scale, bounceY, coinRotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceY.value }, { scale: scale.value }],
  }));

  const coinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${coinRotate.value}deg` }],
  }));

  return (
    <Animated.View style={[animatedStyle, { flexDirection: 'row', alignItems: 'center' }, style]}>
      <Animated.View style={[coinAnimatedStyle, { marginRight: spacing.sm }]}>
        <AppIcon entry={MISC_ICONS.coin} size={22} color={theme.accent} />
      </Animated.View>
      <Text style={[typeScale.numeric, { color: theme.text }, textStyle]}>${displayValue.toLocaleString()}</Text>
    </Animated.View>
  );
}
