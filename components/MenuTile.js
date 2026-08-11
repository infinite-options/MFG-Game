import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import IconChip from './IconChip';
import useBevelPress from './useBevelPress';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const EDGE_HEIGHT = 4;

// A tappable "game menu" tile — same bevel-press physicality as Button/Stepper,
// used for Home's quick-navigation grid instead of a stack of plain buttons.
export default function MenuTile({ icon, label, onPress }) {
  const { theme, spacing, radii, typeScale } = useTheme();
  const bevel = useBevelPress(EDGE_HEIGHT);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bevel.translateY.value }] }));

  return (
    <View style={styles.wrap}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.surfaceEdge, borderRadius: radii.lg, marginBottom: -EDGE_HEIGHT },
        ]}
      />
      <AnimatedPressable
        onPressIn={bevel.onPressIn}
        onPressOut={bevel.onPressOut}
        onPress={onPress}
        style={[
          animatedStyle,
          styles.tile,
          {
            backgroundColor: theme.surface,
            borderRadius: radii.lg,
            padding: spacing.md,
            marginBottom: EDGE_HEIGHT,
          },
        ]}
      >
        <IconChip entry={icon} tone="primary" size={40} />
        <Text style={[typeScale.bodyBold, { color: theme.text, marginTop: spacing.sm, textAlign: 'center' }]}>
          {label}
        </Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minWidth: '45%' },
  tile: { alignItems: 'center', justifyContent: 'center', minHeight: 100 },
});
