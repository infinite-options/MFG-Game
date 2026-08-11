import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, spacing, radii, typeScale } from '../theme/tokens';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const value = useMemo(
    () => ({
      theme: isDark ? darkTheme : lightTheme,
      spacing,
      radii,
      typeScale,
      isDark,
    }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
