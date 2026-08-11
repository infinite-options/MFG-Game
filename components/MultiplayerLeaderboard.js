import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { useTheme } from '../context/ThemeContext';
import { useRoom } from '../context/RoomContext';
import { MISC_ICONS, AppIcon } from '../constants/icons';

// Renders inline inside App.js's top overlay stack (alongside
// ManufacturingBanner) — the live race standings stay visible across every
// tab, and the "paused" state is loud on purpose so it's obvious why the
// game stopped responding. Positioning/safe-area offset is handled by that
// parent stack, not here.
export default function MultiplayerLeaderboard() {
  const { theme, spacing, radii, typeScale } = useTheme();
  const { inRoom, players, myId, roomPaused, missingPlayers, raceEnded, winnerId } = useRoom();

  if (!inRoom) return null;

  const winner = players.find((p) => p.id === winnerId);
  const visiblePlayers = players.filter((p) => p.present || p.cash > 0);

  return (
    <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutUp.duration(180)} pointerEvents="none" style={styles.wrap}>
      {raceEnded ? (
        <View
          style={[
            styles.banner,
            { backgroundColor: theme.accent, borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.xs, shadowColor: theme.shadow },
          ]}
        >
          <AppIcon entry={MISC_ICONS.trophy} size={16} color={theme.primaryText} />
          <Text style={[typeScale.caption, { color: theme.primaryText, marginLeft: spacing.sm }]}>
            {winner ? (winner.id === myId ? 'You won the race!' : `${winner.name} won the race!`) : 'Race finished'}
          </Text>
        </View>
      ) : roomPaused ? (
        <View
          style={[
            styles.banner,
            { backgroundColor: theme.danger, borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.xs, shadowColor: theme.shadow },
          ]}
        >
          <AppIcon entry={MISC_ICONS.paused} size={16} color={theme.primaryText} />
          <Text style={[typeScale.caption, { color: theme.primaryText, marginLeft: spacing.sm }]}>
            Paused — waiting for {missingPlayers.join(', ') || 'a player'} to reconnect
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.row,
          { backgroundColor: theme.surface, borderRadius: radii.pill, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, shadowColor: theme.shadow },
        ]}
      >
        {visiblePlayers.map((p, index) => (
          <View key={p.id} style={[styles.chip, { paddingHorizontal: spacing.sm }]}>
            <Text
              style={[
                typeScale.caption,
                { color: index === 0 ? theme.accent : theme.text, fontWeight: index === 0 ? '800' : '700' },
              ]}
            >
              {index === 0 ? '🏆 ' : ''}
              {p.id === myId ? 'You' : p.name}
              {!p.present ? ' ⚠' : ''}
            </Text>
            <Text style={[typeScale.caption, { color: theme.textMuted }]}>${p.cash.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  chip: { alignItems: 'center' },
});
