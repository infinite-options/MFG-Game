import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Row({ children, justify = 'flex-start', align = 'center', gap = 'sm', style }) {
  const { spacing } = useTheme();
  const gapValue = typeof gap === 'number' ? gap : spacing[gap] ?? spacing.sm;

  return (
    <View
      style={[
        { flexDirection: 'row', justifyContent: justify, alignItems: align, gap: gapValue },
        style,
      ]}
    >
      {children}
    </View>
  );
}
