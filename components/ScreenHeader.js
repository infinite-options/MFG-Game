import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Shared title/subtitle/headerRight markup, used by ScreenContainer and by
// screens (like Market) that need a header without ScreenContainer's padded,
// scrollable body.
export default function ScreenHeader({ title, subtitle, headerRight, style }) {
  const { theme, spacing, typeScale } = useTheme();

  return (
    <View style={[styles.header, style]}>
      <View style={styles.flexOne}>
        <Text style={[typeScale.h1, { color: theme.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typeScale.body, { color: theme.textMuted, marginTop: spacing.xs }]}>{subtitle}</Text>
        ) : null}
      </View>
      {headerRight}
    </View>
  );
}

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
});
