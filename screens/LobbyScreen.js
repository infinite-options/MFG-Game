import React, { useEffect } from 'react';
import { Text } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Row from '../components/Row';
import Button from '../components/Button';
import Badge from '../components/Badge';
import IconChip from '../components/IconChip';
import { useTheme } from '../context/ThemeContext';
import { useRoom } from '../context/RoomContext';
import { useToast } from '../context/ToastContext';
import { MISC_ICONS } from '../constants/icons';

export default function LobbyScreen({ navigation }) {
  const { theme, spacing, typeScale } = useTheme();
  const { roomCode, players, hostId, myId, raceStarted, startRace, leaveRoom } = useRoom();
  const showToast = useToast();

  useEffect(() => {
    if (raceStarted) {
      navigation.replace('InRace');
    }
  }, [raceStarted, navigation]);

  const presentPlayers = players.filter((p) => p.present);
  const isHost = hostId === myId;

  const handleStart = () => {
    const result = startRace();
    if (!result.success) showToast(result.message, 'error');
  };

  const handleLeave = async () => {
    await leaveRoom();
    navigation.navigate('ModeSelect');
  };

  return (
    <ScreenContainer title="Lobby" subtitle="Waiting for everyone to join.">
      <Card style={{ marginBottom: spacing.lg, alignItems: 'center' }}>
        <Text style={[typeScale.caption, { color: theme.textMuted }]}>ROOM CODE</Text>
        <Text style={[typeScale.h1, { color: theme.primary, letterSpacing: 4, marginTop: spacing.xs }]}>
          {roomCode}
        </Text>
        <Text style={[typeScale.caption, { color: theme.textMuted, marginTop: spacing.xs, textAlign: 'center' }]}>
          Share this code with up to 3 friends
        </Text>
      </Card>

      <Row justify="space-between" style={{ marginBottom: spacing.sm }}>
        <Text style={[typeScale.h3, { color: theme.text }]}>Players</Text>
        <Badge label={`${presentPlayers.length}/4`} variant="neutral" />
      </Row>
      <Card style={{ marginBottom: spacing.lg }}>
        {presentPlayers.map((p, index) => (
          <Row
            key={p.id}
            justify="space-between"
            style={{ paddingVertical: spacing.sm, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: theme.border }}
          >
            <Row gap="sm">
              <IconChip entry={MISC_ICONS.person} tone="primary" size={32} iconSize={16} />
              <Text style={[typeScale.body, { color: theme.text }]}>
                {p.name}
                {p.id === myId ? ' (you)' : ''}
              </Text>
            </Row>
            {p.id === hostId ? <IconChip entry={MISC_ICONS.crown} tone="accent" size={28} iconSize={14} /> : null}
          </Row>
        ))}
      </Card>

      {isHost ? (
        <Button
          title={presentPlayers.length < 2 ? 'Need at least 2 players' : 'Start Race'}
          onPress={handleStart}
          disabled={presentPlayers.length < 2}
          style={{ marginBottom: spacing.sm }}
        />
      ) : (
        <Text style={[typeScale.body, { color: theme.textMuted, textAlign: 'center', marginBottom: spacing.sm }]}>
          Waiting for the host to start the race…
        </Text>
      )}
      <Button title="Leave Room" variant="secondary" onPress={handleLeave} />
    </ScreenContainer>
  );
}
