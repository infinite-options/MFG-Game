import React from 'react';
import { Text, View } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';

import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Row from '../components/Row';
import EmptyState from '../components/EmptyState';
import IconChip from '../components/IconChip';
import { useTheme } from '../context/ThemeContext';
import { useGame, RESOURCES, RECIPES, RESOURCE_IDS, RECIPE_IDS } from '../context/GameContext';
import { RESOURCE_ICONS, GOOD_ICONS, MISC_ICONS } from '../constants/icons';

function InventoryRow({ icon, name, quantity, cap }) {
  const { theme, spacing, typeScale } = useTheme();
  return (
    <Row justify="space-between" style={{ paddingVertical: spacing.sm }}>
      <Row gap="sm">
        <IconChip entry={icon} tone="primary" size={32} iconSize={16} />
        <Text style={[typeScale.body, { color: theme.text }]}>{name}</Text>
      </Row>
      <Text style={[typeScale.bodyBold, { color: theme.text }]}>{cap ? `${quantity}/${cap}` : quantity}</Text>
    </Row>
  );
}

export default function InventoryScreen() {
  const { theme, spacing, typeScale } = useTheme();
  const { state, hasAnyGoods, hasAnyOwnedResources } = useGame();

  const ownedResources = RESOURCE_IDS.filter((id) => state.resources[id].owned > 0);
  const ownedGoods = RECIPE_IDS.filter((id) => state.goods[id] > 0);

  if (!hasAnyOwnedResources && !hasAnyGoods) {
    return (
      <ScreenContainer title="Inventory" scroll={false}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon={MISC_ICONS.emptyChest}
            title="Nothing yet"
            subtitle="Visit the market to get started"
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Inventory" subtitle="What you currently own.">
      {ownedResources.length > 0 ? (
        <Card style={{ marginBottom: spacing.lg }} entering={FadeInDown.duration(260).springify().damping(16)}>
          <Text style={[typeScale.h3, { color: theme.text, marginBottom: spacing.xs }]}>Resources</Text>
          {ownedResources.map((id) => (
            <InventoryRow key={id} icon={RESOURCE_ICONS[id]} name={RESOURCES[id].name} quantity={state.resources[id].owned} />
          ))}
        </Card>
      ) : null}

      {ownedGoods.length > 0 ? (
        <Card entering={FadeInDown.delay(70).duration(260).springify().damping(16)}>
          <Text style={[typeScale.h3, { color: theme.text, marginBottom: spacing.xs }]}>Goods</Text>
          {ownedGoods.map((id) => (
            <InventoryRow
              key={id}
              icon={GOOD_ICONS[id]}
              name={RECIPES[id].name}
              quantity={state.goods[id]}
              cap={RECIPES[id].maxHeld}
            />
          ))}
        </Card>
      ) : null}
    </ScreenContainer>
  );
}
