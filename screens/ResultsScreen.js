import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Row from '../components/Row';
import Button from '../components/Button';
import ConfettiBurst from '../components/ConfettiBurst';
import { useTheme } from '../context/ThemeContext';
import { useGame, STARTING_CASH, OBJECTIVE_TARGET } from '../context/GameContext';
import { useRoom } from '../context/RoomContext';
import { useToast } from '../context/ToastContext';
import { MISC_ICONS, AppIcon } from '../constants/icons';

function Trophy() {
  const { theme } = useTheme();
  const scale = useSharedValue(0);
  const rotate = useSharedValue(-12);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8, stiffness: 140 });
    rotate.value = withSequence(withTiming(8, { duration: 120 }), withSpring(0, { damping: 6, stiffness: 200 }));
  }, [rotate, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <AppIcon entry={MISC_ICONS.trophy} size={48} color={theme.accent} />
    </Animated.View>
  );
}

function Standings({ players, myId, winnerId }) {
  const { theme, spacing, typeScale } = useTheme();
  return (
    <Card style={{ marginTop: spacing.lg }}>
      <Text style={[typeScale.h3, { color: theme.text, marginBottom: spacing.sm }]}>Final standings</Text>
      {players.map((p, index) => (
        <Row
          key={p.id}
          justify="space-between"
          style={{ paddingVertical: spacing.sm, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: theme.border }}
        >
          <Row gap="sm">
            <Text style={[typeScale.bodyBold, { color: theme.textMuted, minWidth: 20 }]}>{index + 1}.</Text>
            <Text style={[typeScale.body, { color: theme.text }]}>
              {p.id === winnerId ? '🏆 ' : ''}
              {p.id === myId ? 'You' : p.name}
            </Text>
          </Row>
          <Text style={[typeScale.bodyBold, { color: theme.text }]}>${p.cash.toLocaleString()}</Text>
        </Row>
      ))}
    </Card>
  );
}

export default function ResultsScreen() {
  const { theme, spacing, typeScale } = useTheme();
  const { state, resetGame } = useGame();
  const { inRoom, players, myId, winnerId, raceEnded, leaveRoom } = useRoom();
  const showToast = useToast();
  const navigation = useNavigation();

  const profit = state.cash - STARTING_CASH;
  const isProfit = profit >= 0;
  const iWon = inRoom && winnerId === myId;

  const handleReset = () => {
    resetGame();
    showToast('New game started', 'success');
  };

  const handleLeaveRoom = async () => {
    await leaveRoom();
    navigation.getParent()?.navigate('ModeSelect');
  };

  const showWinCelebration = inRoom ? raceEnded && iWon : state.hasWon;
  const showRaceOverForSomeoneElse = inRoom && raceEnded && !iWon;

  if (showWinCelebration) {
    return (
      <ScreenContainer title="Results" scroll={inRoom}>
        <View style={inRoom ? undefined : { flex: 1, justifyContent: 'center' }}>
          <ConfettiBurst />
          <Card
            style={{
              backgroundColor: theme.accentSoft,
              borderTopColor: theme.accent,
              borderLeftColor: theme.accent,
              borderRightColor: theme.accent,
              borderBottomColor: theme.accentEdge,
              alignItems: 'center',
              paddingVertical: spacing.xxl,
            }}
          >
            <Trophy />
            <Text style={[typeScale.h1, { color: theme.accent, marginTop: spacing.md, textAlign: 'center' }]}>
              {inRoom ? 'You won the race!' : `You reached $${OBJECTIVE_TARGET.toLocaleString()}!`}
            </Text>
            <Text style={[typeScale.body, { color: theme.text, marginTop: spacing.sm }]}>
              Final cash: ${state.cash.toLocaleString()}
            </Text>
            <Text style={[typeScale.bodyBold, { color: theme.accent, marginTop: spacing.xs }]}>
              Profit: +${profit.toLocaleString()}
            </Text>
          </Card>
          {inRoom ? (
            <>
              <Standings players={players} myId={myId} winnerId={winnerId} />
              <Button title="Leave Room" onPress={handleLeaveRoom} style={{ marginTop: spacing.lg }} />
            </>
          ) : (
            <Button title="Play Again" onPress={handleReset} style={{ marginTop: spacing.lg }} />
          )}
        </View>
      </ScreenContainer>
    );
  }

  if (showRaceOverForSomeoneElse) {
    const winner = players.find((p) => p.id === winnerId);
    const myRank = players.findIndex((p) => p.id === myId) + 1;
    return (
      <ScreenContainer title="Results">
        <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <AppIcon entry={MISC_ICONS.trophy} size={40} color={theme.textMuted} />
          <Text style={[typeScale.h2, { color: theme.text, marginTop: spacing.md, textAlign: 'center' }]}>
            {winner ? `${winner.name} won the race!` : 'The race has ended'}
          </Text>
          <Text style={[typeScale.body, { color: theme.textMuted, marginTop: spacing.sm, textAlign: 'center' }]}>
            {myRank > 0 ? `You finished ${myRank}${myRank === 2 ? 'nd' : myRank === 3 ? 'rd' : 'th'} with $${state.cash.toLocaleString()}.` : ''}
          </Text>
        </Card>
        <Standings players={players} myId={myId} winnerId={winnerId} />
        <Button title="Leave Room" onPress={handleLeaveRoom} style={{ marginTop: spacing.lg }} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Results" scroll={inRoom}>
      <View style={inRoom ? undefined : { flex: 1, justifyContent: 'center' }}>
        <Card style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
          <Text style={[typeScale.h2, { color: theme.text, textAlign: 'center' }]}>Still in progress</Text>
          <Text style={[typeScale.body, { color: theme.textMuted, marginTop: spacing.sm, textAlign: 'center' }]}>
            {inRoom
              ? 'The race is still on — first to the objective wins.'
              : 'Keep buying, crafting, and selling to reach the objective.'}
          </Text>
          <Text style={[typeScale.numeric, { color: theme.text, marginTop: spacing.lg }]}>
            ${state.cash.toLocaleString()}
          </Text>
          <Text style={[typeScale.caption, { color: isProfit ? theme.accent : theme.danger, marginTop: spacing.xs }]}>
            {isProfit ? '+' : ''}
            {profit.toLocaleString()} vs. starting cash
          </Text>
        </Card>
        {inRoom ? <Standings players={players} myId={myId} winnerId={winnerId} /> : null}
      </View>
    </ScreenContainer>
  );
}
