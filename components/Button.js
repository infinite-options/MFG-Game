import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import useBevelPress from './useBevelPress';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  icon = null,
  fullWidth = true,
  size = 'md',
  style,
}) {
  const { theme, spacing, radii, typeScale } = useTheme();

  // Secondary is a transparent outline button — it can't show a bevel edge
  // convincingly, so it keeps the simpler scale-press feedback instead.
  const isBeveled = variant !== 'secondary';
  const bevelHeight = spacing.xs;
  const bevel = useBevelPress(bevelHeight);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bevel.translateY.value }, { scale: scale.value }],
  }));

  const palette = {
    primary: { bg: theme.primary, fg: theme.primaryText, edge: theme.primaryEdge, border: 'transparent' },
    secondary: { bg: 'transparent', fg: theme.primary, edge: null, border: theme.primary },
    danger: { bg: theme.danger, fg: theme.primaryText, edge: theme.dangerEdge, border: 'transparent' },
  }[variant];

  const paddingVertical = size === 'sm' ? spacing.sm : spacing.md;

  const handlePressIn = () => {
    if (isBeveled) {
      bevel.onPressIn();
    } else {
      scale.value = withTiming(0.96, { duration: 80 });
    }
  };

  const handlePressOut = () => {
    if (isBeveled) {
      bevel.onPressOut();
    } else {
      scale.value = withTiming(1, { duration: 120 });
    }
  };

  return (
    <View style={[{ alignSelf: fullWidth ? 'stretch' : 'flex-start' }, style]}>
      {isBeveled ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: disabled ? theme.border : palette.edge,
              borderRadius: radii.md,
            },
          ]}
        />
      ) : null}
      <AnimatedPressable
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          animatedStyle,
          styles.base,
          {
            backgroundColor: disabled ? theme.border : palette.bg,
            borderColor: disabled ? theme.border : palette.border,
            borderWidth: variant === 'secondary' ? 2 : 0,
            borderRadius: radii.md,
            paddingVertical,
            paddingHorizontal: spacing.lg,
            marginBottom: isBeveled ? bevelHeight : 0,
            opacity: disabled ? 0.6 : 1,
            overflow: 'hidden',
          },
        ]}
      >
        {isBeveled && !disabled ? <View style={[styles.gloss, { borderRadius: radii.md }]} /> : null}
        <View style={styles.content}>
          {icon}
          <Text
            style={[
              typeScale.bodyBold,
              {
                color: disabled ? theme.textMuted : palette.fg,
                marginLeft: icon ? spacing.sm : 0,
              },
            ]}
          >
            {title}
          </Text>
        </View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
});
