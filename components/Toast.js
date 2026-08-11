import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { MISC_ICONS, AppIcon } from '../constants/icons';

export default function Toast({ message, variant }) {
  const { theme, spacing, radii, typeScale } = useTheme();
  const isError = variant === 'error';
  const iconEntry = isError ? MISC_ICONS.error : MISC_ICONS.success;
  const backgroundColor = isError ? theme.dangerSoft : theme.accentSoft;
  const color = isError ? theme.danger : theme.accent;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(14).mass(0.7)}
      exiting={FadeOutUp.duration(180)}
      style={[
        styles.toast,
        {
          backgroundColor,
          borderRadius: radii.md,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          marginTop: spacing.xs,
          shadowColor: theme.shadow,
        },
      ]}
    >
      <AppIcon entry={iconEntry} size={18} color={color} />
      <Text style={[typeScale.bodyBold, { color, marginLeft: spacing.sm, flexShrink: 1 }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    maxWidth: '92%',
  },
});
