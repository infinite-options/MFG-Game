import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Badge({ label, variant = 'neutral' }) {
  const { theme, spacing, radii, typeScale } = useTheme();

  const palette = {
    neutral: { bg: theme.surfaceAlt, fg: theme.textMuted },
    success: { bg: theme.accentSoft, fg: theme.accent },
    danger: { bg: theme.dangerSoft, fg: theme.danger },
  }[variant];

  return (
    <View
      style={{
        backgroundColor: palette.bg,
        borderRadius: radii.pill,
        paddingVertical: spacing.xs / 2,
        paddingHorizontal: spacing.sm,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={[typeScale.caption, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}
