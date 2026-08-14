import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { BUILD_VERSION } from '../constants/buildInfo';

export default function BuildTag() {
  const { theme, typeScale } = useTheme();
  return (
    <Text pointerEvents="none" style={[typeScale.caption, styles.tag, { color: theme.textMuted }]}>
      Version {BUILD_VERSION}
    </Text>
  );
}

const styles = StyleSheet.create({
  tag: { textAlign: 'center', paddingVertical: 4 },
});
