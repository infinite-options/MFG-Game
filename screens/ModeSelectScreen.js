import React from 'react';
import { Text, View } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Row from '../components/Row';
import IconChip from '../components/IconChip';
import MenuTile from '../components/MenuTile';
import { useTheme } from '../context/ThemeContext';
import { STARTING_CASH, OBJECTIVE_TARGET } from '../context/GameContext';
import { MISC_ICONS } from '../constants/icons';

export default function ModeSelectScreen({ navigation }) {
  const { theme, spacing, typeScale } = useTheme();

  return (
    <ScreenContainer title="Resource Co." subtitle="Buy resources, craft goods, sell for profit.">
      <Card style={{ marginBottom: spacing.lg }}>
        <Row gap="sm">
          <IconChip entry={MISC_ICONS.coin} tone="accent" size={32} />
          <Text style={[typeScale.body, { color: theme.text }]}>
            Start with ${STARTING_CASH.toLocaleString()} — first to ${OBJECTIVE_TARGET.toLocaleString()} wins.
          </Text>
        </Row>
      </Card>

      <Text style={[typeScale.h2, { color: theme.text, marginBottom: spacing.md }]}>How do you want to play?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <MenuTile icon={MISC_ICONS.dice} label="Solo" onPress={() => navigation.navigate('InRace')} />
        <MenuTile icon={MISC_ICONS.people} label="Multiplayer" onPress={() => navigation.navigate('RoomSetup')} />
      </View>
    </ScreenContainer>
  );
}
