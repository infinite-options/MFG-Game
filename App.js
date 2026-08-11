import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { GameProvider } from './context/GameContext';
import { RoomProvider } from './context/RoomContext';
import { ToastProvider } from './context/ToastContext';
import RootStackNavigator from './navigation/RootStackNavigator';
import ManufacturingBanner from './components/ManufacturingBanner';
import MultiplayerLeaderboard from './components/MultiplayerLeaderboard';

function AppNavigation() {
  const { theme, isDark, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <RootStackNavigator />
      </NavigationContainer>
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: insets.top + spacing.sm,
          alignItems: 'center',
          gap: spacing.xs,
          zIndex: 25,
        }}
      >
        <MultiplayerLeaderboard />
        <ManufacturingBanner />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GameProvider>
          <RoomProvider>
            <ToastProvider>
              <AppNavigation />
            </ToastProvider>
          </RoomProvider>
        </GameProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
