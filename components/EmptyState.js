import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AppIcon } from '../constants/icons';

export default function EmptyState({ icon, title, subtitle }) {
  const { theme, spacing, typeScale } = useTheme();

  return (
    <View style={[styles.container, { paddingVertical: spacing.xxl }]}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme.surfaceAlt, marginBottom: spacing.md },
        ]}
      >
        <AppIcon entry={icon} size={28} color={theme.textMuted} />
      </View>
      <Text style={[typeScale.h3, { color: theme.text, textAlign: 'center' }]}>{title}</Text>
      {subtitle ? (
        <Text
          style={[
            typeScale.body,
            { color: theme.textMuted, textAlign: 'center', marginTop: spacing.xs },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
