import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AppIcon } from '../constants/icons';

// A tinted circular icon badge — the one consistent way an icon gets a
// backdrop anywhere in the app (card headers, menu tiles, list rows), instead
// of every screen inventing its own bare-icon-plus-color treatment.
export default function IconChip({ entry, tone = 'primary', size = 36, iconSize, style }) {
  const { theme } = useTheme();
  const resolvedIconSize = iconSize ?? Math.round(size * 0.5);

  const palette = {
    primary: { bg: theme.primarySoft, fg: theme.primary },
    accent: { bg: theme.accentSoft, fg: theme.accent },
    danger: { bg: theme.dangerSoft, fg: theme.danger },
    neutral: { bg: theme.surfaceAlt, fg: theme.textMuted },
  }[tone];

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: palette.bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <AppIcon entry={entry} size={resolvedIconSize} color={palette.fg} />
    </View>
  );
}
