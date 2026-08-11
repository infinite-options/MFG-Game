import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { MISC_ICONS, AppIcon } from '../constants/icons';
import useBevelPress from './useBevelPress';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SIZE = 30;
const EDGE_HEIGHT = 2;

function StepButton({ entry, onPress, disabled, theme, radii }) {
  const { translateY, onPressIn, onPressOut } = useBevelPress(EDGE_HEIGHT);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <View style={{ width: SIZE, height: SIZE + EDGE_HEIGHT }}>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: disabled ? theme.surfaceAlt : theme.primaryEdge,
            borderRadius: radii.sm,
          },
        ]}
      />
      <AnimatedPressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          animatedStyle,
          styles.stepButton,
          {
            backgroundColor: disabled ? theme.surfaceAlt : theme.primary,
            borderRadius: radii.sm,
          },
        ]}
      >
        <AppIcon entry={entry} size={16} color={disabled ? theme.textMuted : theme.primaryText} />
      </AnimatedPressable>
    </View>
  );
}

export default function Stepper({ value, onChange, min = 0, max }) {
  const { theme, spacing, radii, typeScale } = useTheme();

  return (
    <View style={[styles.container, { gap: spacing.sm }]}>
      <StepButton
        entry={MISC_ICONS.minus}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
        theme={theme}
        radii={radii}
      />
      <Text style={[typeScale.bodyBold, { color: theme.text, minWidth: 24, textAlign: 'center' }]}>{value}</Text>
      <StepButton
        entry={MISC_ICONS.plus}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
        theme={theme}
        radii={radii}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  stepButton: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', marginBottom: EDGE_HEIGHT },
});
