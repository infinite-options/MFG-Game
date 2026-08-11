import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

export default function Card({ children, style, entering }) {
  const { theme, spacing, radii } = useTheme();
  return (
    <Animated.View
      entering={entering}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderRadius: radii.lg,
          padding: spacing.lg,
          borderTopColor: theme.border,
          borderLeftColor: theme.border,
          borderRightColor: theme.border,
          borderBottomColor: theme.surfaceEdge,
          shadowColor: theme.shadow,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 3,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});
