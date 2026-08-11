import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

export default function ProgressBar({ progress, height = 14 }) {
  const { theme, radii } = useTheme();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(progress, { damping: 16, stiffness: 120, mass: 0.9 });
  }, [progress, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: theme.surfaceAlt, borderRadius: radii.pill, height },
      ]}
    >
      <Animated.View
        style={[
          animatedStyle,
          styles.fill,
          { backgroundColor: theme.accent, borderRadius: radii.pill },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
