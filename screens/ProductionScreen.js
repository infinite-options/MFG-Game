import React from 'react';
import { Text, View } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';

import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Row from '../components/Row';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import IconChip from '../components/IconChip';
import useCountdown from '../components/useCountdown';
import { useTheme } from '../context/ThemeContext';
import { useGame, RECIPES, RESOURCES, RECIPE_IDS } from '../context/GameContext';
import { useRoom } from '../context/RoomContext';
import { useToast } from '../context/ToastContext';
import { formatCountdown } from '../utils/time';
import { GOOD_ICONS, RESOURCE_ICONS, AppIcon } from '../constants/icons';

function RecipeCard({ id, index, isActive }) {
  const { theme, spacing, typeScale } = useTheme();
  const { state, craftGood, craftBlockReason, missingInputs } = useGame();
  const { inRoom, roomPaused, raceEnded } = useRoom();
  const showToast = useToast();

  const recipe = RECIPES[id];
  const blockReason = craftBlockReason(id);
  const missing = missingInputs(id);
  const owned = state.goods[id];
  const manufacturing = state.manufacturing;
  const raceBlocked = inRoom && (roomPaused || raceEnded);

  const remainingMs = useCountdown(isActive ? manufacturing.endsAt : null);
  const totalMs = isActive ? Math.max(1, manufacturing.endsAt - manufacturing.startedAt) : 1;
  const progress = isActive ? Math.min(1, Math.max(0, 1 - remainingMs / totalMs)) : 0;

  let statusMessage = null;
  if (!isActive) {
    if (blockReason === 'busy') {
      statusMessage = 'Manufacturing another batch — please wait';
    } else if (raceEnded) {
      statusMessage = 'The race has ended';
    } else if (roomPaused) {
      statusMessage = 'Room paused — waiting for a player to reconnect';
    } else if (blockReason === 'missing') {
      statusMessage = `Missing ${missing.map((rid) => RESOURCES[rid].name).join(', ')}`;
    } else if (blockReason === 'full') {
      statusMessage = `Storage full — sell some ${recipe.name} first (max ${recipe.maxHeld})`;
    }
  }

  const handleCraft = () => {
    const result = craftGood(id);
    showToast(result.message, result.success ? 'success' : 'error');
  };

  return (
    <Card entering={FadeInDown.delay(index * 70).duration(260).springify().damping(16)}>
      <Row justify="space-between" align="flex-start">
        <Row gap="sm">
          <IconChip entry={GOOD_ICONS[id]} tone="primary" size={44} />
          <Text style={[typeScale.h3, { color: theme.text }]}>{recipe.name}</Text>
        </Row>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[typeScale.caption, { color: theme.textMuted }]}>
            Yields {recipe.yield} · ${recipe.sellPrice}/ea
          </Text>
          <Text style={[typeScale.caption, { color: theme.textMuted, marginTop: 2 }]}>
            {formatCountdown(recipe.craftTimeMs)} to craft · {owned}/{recipe.maxHeld} held
          </Text>
        </View>
      </Row>

      <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
        {Object.entries(recipe.inputs).map(([resourceId, amount]) => {
          const ownedResource = state.resources[resourceId].owned;
          const met = ownedResource >= amount;
          return (
            <Row key={resourceId} justify="space-between">
              <Row gap="xs">
                <AppIcon
                  entry={RESOURCE_ICONS[resourceId]}
                  size={16}
                  color={met ? theme.textMuted : theme.danger}
                />
                <Text style={[typeScale.body, { color: theme.textMuted }]}>{RESOURCES[resourceId].name}</Text>
              </Row>
              <Text style={[typeScale.bodyBold, { color: met ? theme.text : theme.danger }]}>
                {ownedResource} / {amount}
              </Text>
            </Row>
          );
        })}
      </View>

      {isActive ? (
        <View style={{ marginTop: spacing.md }}>
          <Row justify="space-between" style={{ marginBottom: spacing.xs }}>
            <Text style={[typeScale.caption, { color: theme.primary }]}>Manufacturing…</Text>
            <Text style={[typeScale.caption, { color: theme.primary }]}>{formatCountdown(remainingMs)}</Text>
          </Row>
          <ProgressBar progress={progress} height={8} />
        </View>
      ) : statusMessage ? (
        <Text style={[typeScale.caption, { color: theme.danger, marginTop: spacing.sm }]}>{statusMessage}</Text>
      ) : null}

      <Button
        title={isActive ? 'Manufacturing…' : `Craft ${recipe.name}`}
        onPress={handleCraft}
        disabled={blockReason !== null || raceBlocked}
        size="sm"
        style={{ marginTop: spacing.md }}
      />
    </Card>
  );
}

export default function ProductionScreen() {
  const { spacing } = useTheme();
  const { state } = useGame();

  return (
    <ScreenContainer title="Production" subtitle="Combine resources into sellable goods.">
      <View style={{ gap: spacing.md }}>
        {RECIPE_IDS.map((id, index) => (
          <RecipeCard key={id} id={id} index={index} isActive={state.manufacturing?.recipeId === id} />
        ))}
      </View>
    </ScreenContainer>
  );
}
