import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { useTheme } from '../context/ThemeContext';
import { useGame, RECIPES } from '../context/GameContext';
import { GOOD_ICONS, AppIcon } from '../constants/icons';
import { formatCountdown } from '../utils/time';
import useCountdown from './useCountdown';

// Renders inline inside App.js's top overlay stack (alongside
// MultiplayerLeaderboard) so the active manufacturing run — and the fact that
// everything else is locked until it finishes — stays visible no matter which
// tab is open. Positioning/safe-area offset is handled by that parent stack,
// not here, so multiple banners can't render on top of each other.
export default function ManufacturingBanner() {
  const { theme, spacing, radii, typeScale } = useTheme();
  const { state } = useGame();
  const manufacturing = state.manufacturing;
  const remainingMs = useCountdown(manufacturing?.endsAt);

  if (!manufacturing) return null;

  const recipe = RECIPES[manufacturing.recipeId];
  const totalMs = Math.max(1, manufacturing.endsAt - manufacturing.startedAt);
  const progress = Math.min(1, Math.max(0, 1 - remainingMs / totalMs));

  return (
    <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutUp.duration(180)} pointerEvents="none" style={styles.wrap}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: theme.primary,
            borderRadius: radii.pill,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            shadowColor: theme.shadow,
          },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: theme.primaryEdge }]}>
          <AppIcon entry={GOOD_ICONS[recipe.id]} size={14} color={theme.primaryText} />
        </View>
        <Text style={[typeScale.caption, { color: theme.primaryText, marginLeft: spacing.sm }]}>
          Manufacturing {recipe.name} · {formatCountdown(remainingMs)}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.primaryEdge, borderRadius: radii.pill }]}>
        <View
          style={[
            styles.fill,
            { width: `${progress * 100}%`, backgroundColor: theme.accent, borderRadius: radii.pill },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  iconWrap: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  track: { width: '56%', height: 4, marginTop: 6, overflow: 'hidden' },
  fill: { height: '100%' },
});
