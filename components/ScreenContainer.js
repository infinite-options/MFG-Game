import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from './ScreenHeader';

export default function ScreenContainer({ title, subtitle, headerRight, children, scroll = true }) {
  const { theme, spacing } = useTheme();
  const Wrapper = scroll ? ScrollView : View;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Wrapper
        style={scroll ? undefined : styles.flexOne}
        contentContainerStyle={scroll ? [styles.scrollContent, { padding: spacing.lg }] : undefined}
      >
        <View style={!scroll ? [styles.flexOne, { padding: spacing.lg }] : undefined}>
          {title ? (
            <ScreenHeader
              title={title}
              subtitle={subtitle}
              headerRight={headerRight}
              style={{ marginBottom: spacing.lg }}
            />
          ) : null}
          {children}
        </View>
      </Wrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flexOne: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
});
