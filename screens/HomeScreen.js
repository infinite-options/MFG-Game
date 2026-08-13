import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Row from '../components/Row';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import CashDisplay from '../components/CashDisplay';
import IconChip from '../components/IconChip';
import MenuTile from '../components/MenuTile';
import HowToPlayModal from '../components/HowToPlayModal';
import { useTheme } from '../context/ThemeContext';
import { useGame, OBJECTIVE_TARGET } from '../context/GameContext';
import { useRoom } from '../context/RoomContext';
import { TAB_ICONS, MISC_ICONS, AppIcon } from '../constants/icons';
import { BUILD_VERSION } from '../constants/buildInfo';

const NAV_TARGETS = [
  { route: 'Market', label: 'Market' },
  { route: 'Production', label: 'Production' },
  { route: 'Inventory', label: 'Inventory' },
  { route: 'Objective', label: 'Objective' },
];

export default function HomeScreen() {
  const { theme, spacing, typeScale } = useTheme();
  const { state, progress } = useGame();
  const { inRoom, raceEnded, winnerId, myId } = useRoom();
  const navigation = useNavigation();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const hasNavigatedOnRaceEnd = useRef(false);

  // Own wins navigate from ObjectiveScreen (where selling happens, so it's
  // always mounted when state.hasWon flips). A win by someone ELSE can
  // arrive while any tab is focused, so it's handled here instead — Home is
  // the tab navigator's initial route and so is guaranteed already mounted.
  useEffect(() => {
    if (inRoom && raceEnded && winnerId && winnerId !== myId) {
      if (!hasNavigatedOnRaceEnd.current) {
        hasNavigatedOnRaceEnd.current = true;
        navigation.navigate('Results');
      }
    } else {
      hasNavigatedOnRaceEnd.current = false;
    }
  }, [inRoom, raceEnded, winnerId, myId, navigation]);

  return (
    <ScreenContainer
      title="Resource Co."
      subtitle="Buy resources, craft goods, sell for profit."
      headerRight={
        <Button
          title=""
          icon={<AppIcon entry={MISC_ICONS.help} size={20} color={theme.primary} />}
          variant="secondary"
          fullWidth={false}
          size="sm"
          onPress={() => setShowHowToPlay(true)}
        />
      }
    >
      <HowToPlayModal visible={showHowToPlay} onClose={() => setShowHowToPlay(false)} />

      <Card
        style={{
          marginBottom: spacing.lg,
          borderTopColor: theme.accent,
          borderLeftColor: theme.accent,
          borderRightColor: theme.accent,
        }}
      >
        <Row gap="sm">
          <IconChip entry={MISC_ICONS.coin} tone="accent" size={32} />
          <Text style={[typeScale.caption, { color: theme.textMuted }]}>CASH ON HAND</Text>
        </Row>
        <CashDisplay value={state.cash} style={{ marginTop: spacing.sm, marginBottom: spacing.md }} />

        <Row justify="space-between" style={{ marginBottom: spacing.xs }}>
          <Text style={[typeScale.caption, { color: theme.textMuted }]}>PROGRESS TO OBJECTIVE</Text>
          <Text style={[typeScale.caption, { color: theme.textMuted }]}>
            ${state.cash.toLocaleString()} / ${OBJECTIVE_TARGET.toLocaleString()}
          </Text>
        </Row>
        <ProgressBar progress={progress} />
      </Card>

      <Row gap="sm" style={{ marginBottom: spacing.md }}>
        <Text style={[typeScale.h2, { color: theme.text }]}>Get started</Text>
        <AppIcon entry={MISC_ICONS.dice} size={20} color={theme.textMuted} />
      </Row>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {NAV_TARGETS.map(({ route, label }) => (
          <MenuTile
            key={route}
            icon={TAB_ICONS[route]}
            label={label}
            onPress={() => navigation.navigate(route)}
          />
        ))}
      </View>

      <Text
        style={[
          typeScale.caption,
          { color: theme.textMuted, textAlign: 'center', marginTop: spacing.xl },
        ]}
      >
        Build {BUILD_VERSION}
      </Text>
    </ScreenContainer>
  );
}
