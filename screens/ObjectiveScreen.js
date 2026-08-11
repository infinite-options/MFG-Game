import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FadeInDown } from 'react-native-reanimated';

import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Row from '../components/Row';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import IconChip from '../components/IconChip';
import { useTheme } from '../context/ThemeContext';
import { useGame, RECIPES, OBJECTIVE_TARGET, RECIPE_IDS } from '../context/GameContext';
import { useRoom } from '../context/RoomContext';
import { useToast } from '../context/ToastContext';
import { GOOD_ICONS, MISC_ICONS } from '../constants/icons';

export default function ObjectiveScreen() {
  const { theme, spacing, typeScale } = useTheme();
  const { state, progress, sellGood, hasAnyGoods, isManufacturing } = useGame();
  const { inRoom, roomPaused, raceEnded } = useRoom();
  const showToast = useToast();
  const raceBlocked = inRoom && (roomPaused || raceEnded);
  const navigation = useNavigation();
  const hasNavigatedOnWin = useRef(false);

  useEffect(() => {
    if (state.hasWon) {
      if (!hasNavigatedOnWin.current) {
        hasNavigatedOnWin.current = true;
        navigation.navigate('Results');
      }
    } else {
      // Tab screens stay mounted across a Play Again reset, so this ref must be
      // cleared whenever hasWon goes back to false or the next win won't auto-navigate.
      hasNavigatedOnWin.current = false;
    }
  }, [state.hasWon, navigation]);

  const remaining = Math.max(0, OBJECTIVE_TARGET - state.cash);
  const sellableGoods = RECIPE_IDS.filter((id) => state.goods[id] > 0);

  const handleSell = (goodId) => {
    const result = sellGood(goodId);
    showToast(result.message, result.success ? 'success' : 'error');
  };

  return (
    <ScreenContainer title="Objective" subtitle={`Reach $${OBJECTIVE_TARGET.toLocaleString()} in cash.`}>
      <Card style={{ marginBottom: spacing.lg }} entering={FadeInDown.duration(280)}>
        <Row justify="space-between" style={{ marginBottom: spacing.sm }}>
          <Text style={[typeScale.h3, { color: theme.text }]}>${state.cash.toLocaleString()}</Text>
          <Text style={[typeScale.caption, { color: theme.textMuted }]}>
            {remaining > 0 ? `$${remaining.toLocaleString()} to go` : 'Objective reached!'}
          </Text>
        </Row>
        <ProgressBar progress={progress} />
      </Card>

      {!hasAnyGoods ? (
        <EmptyState
          icon={MISC_ICONS.trendingUp}
          title="Nothing to sell yet"
          subtitle="Craft goods in Production, then sell them here."
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {isManufacturing ? (
            <Text style={[typeScale.caption, { color: theme.danger }]}>
              Manufacturing in progress — selling is paused until it finishes.
            </Text>
          ) : raceEnded ? (
            <Text style={[typeScale.caption, { color: theme.danger }]}>The race has ended — selling is closed.</Text>
          ) : roomPaused ? (
            <Text style={[typeScale.caption, { color: theme.danger }]}>
              Room paused — waiting for a player to reconnect.
            </Text>
          ) : null}
          {sellableGoods.map((id, index) => {
            const recipe = RECIPES[id];
            return (
              <Card key={id} entering={FadeInDown.delay(index * 70).duration(260).springify().damping(16)}>
                <Row justify="space-between">
                  <Row gap="sm">
                    <IconChip entry={GOOD_ICONS[id]} tone="primary" size={40} />
                    <View>
                      <Text style={[typeScale.bodyBold, { color: theme.text }]}>{recipe.name}</Text>
                      <Text style={[typeScale.caption, { color: theme.textMuted, marginTop: 2 }]}>
                        You have {state.goods[id]} · ${recipe.sellPrice} each
                      </Text>
                    </View>
                  </Row>
                  <Button
                    title="Sell 1"
                    size="sm"
                    fullWidth={false}
                    disabled={isManufacturing || raceBlocked}
                    onPress={() => handleSell(id)}
                  />
                </Row>
              </Card>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
}
