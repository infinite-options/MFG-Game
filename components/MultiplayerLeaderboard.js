import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { useTheme } from '../context/ThemeContext';
import { useRoom } from '../context/RoomContext';
import { MISC_ICONS, AppIcon } from '../constants/icons';

const CONTINUE_WITHOUT_GRACE_MS = 30000;

// Renders inline inside App.js's top overlay stack (alongside
// ManufacturingBanner) — the live race standings stay visible across every
// tab, and the "paused" state is loud on purpose so it's obvious why the
// game stopped responding. pointerEvents is "box-none" so the transparent
// gaps in this overlay don't block taps on whatever's underneath, while the
// host's "Continue without" button (once it appears) is still tappable.
export default function MultiplayerLeaderboard() {
  const { theme, spacing, radii, typeScale } = useTheme();
  const { inRoom, players, myId, isHost, roomPaused, missingPlayers, raceEnded, winnerId, continueWithoutPlayer } =
    useRoom();
  const pausedSinceRef = useRef(null);
  const [graceElapsed, setGraceElapsed] = useState(false);

  useEffect(() => {
    if (!roomPaused) {
      pausedSinceRef.current = null;
      setGraceElapsed(false);
      return undefined;
    }
    if (!pausedSinceRef.current) pausedSinceRef.current = Date.now();
    const remaining = CONTINUE_WITHOUT_GRACE_MS - (Date.now() - pausedSinceRef.current);
    const timeoutId = setTimeout(() => setGraceElapsed(true), Math.max(0, remaining));
    return () => clearTimeout(timeoutId);
  }, [roomPaused]);

  if (!inRoom) return null;

  const winner = players.find((p) => p.id === winnerId);
  const visiblePlayers = players.filter((p) => p.present || p.cash > 0);
  const missingPlayerObjs = players.filter((p) => !p.present && missingPlayers.includes(p.name));

  return (
    <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutUp.duration(180)} pointerEvents="box-none" style={styles.wrap}>
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
        <View style={{ alignItems: 'center', marginBottom: spacing.xs }} pointerEvents="box-none">
          <View
            style={[
              styles.banner,
              { backgroundColor: theme.danger, borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, shadowColor: theme.shadow },
            ]}
          >
            <AppIcon entry={MISC_ICONS.paused} size={16} color={theme.primaryText} />
            <Text style={[typeScale.caption, { color: theme.primaryText, marginLeft: spacing.sm }]}>
              Paused — waiting for {missingPlayers.join(', ') || 'a player'} to reconnect
            </Text>
          </View>
          {isHost && graceElapsed
            ? missingPlayerObjs.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => continueWithoutPlayer(p.id)}
                  style={[
                    styles.continueButton,
                    { backgroundColor: theme.surface, borderRadius: radii.pill, borderColor: theme.danger },
                  ]}
                >
                  <Text style={[typeScale.caption, { color: theme.danger, fontWeight: '700' }]}>
                    Continue without {p.name}
                  </Text>
                </Pressable>
              ))
            : null}
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
  continueButton: {
    marginTop: 6,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
});
