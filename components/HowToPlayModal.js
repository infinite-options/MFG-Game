import React from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FadeInDown } from 'react-native-reanimated';

import Card from './Card';
import Row from './Row';
import Button from './Button';
import IconChip from './IconChip';
import { useTheme } from '../context/ThemeContext';
import { STARTING_CASH, OBJECTIVE_TARGET, RESOURCES, RECIPES, RESOURCE_IDS, RECIPE_IDS } from '../context/GameContext';
import { RESOURCE_ICONS, GOOD_ICONS, TAB_ICONS, MISC_ICONS, AppIcon } from '../constants/icons';
import { formatCountdown } from '../utils/time';

const STEPS = [
  {
    icon: TAB_ICONS.Market,
    title: '1. Buy resources in the Market',
    body: 'Each resource has a fixed price and a limited stock that never restocks — plan your purchases, you can\'t buy more once a resource sells out.',
  },
  {
    icon: TAB_ICONS.Production,
    title: '2. Craft goods in Production',
    body: 'Every recipe needs specific resources in specific amounts. Once you own enough, the Craft button lights up and turns them into sellable goods.',
  },
  {
    icon: MISC_ICONS.clock,
    title: '3. Wait out the manufacturing timer',
    body: "Crafting takes real time — bigger, rarer goods take longer. While a batch is running you can't buy, craft, or sell anything else, anywhere in the app, until it finishes. Each good also has a storage cap, so you can't stockpile an unlimited amount.",
  },
  {
    icon: MISC_ICONS.trendingUp,
    title: '4. Sell goods in Objective',
    body: 'Sell your crafted goods one at a time for cash. Watch the progress bar climb toward the target.',
  },
  {
    icon: MISC_ICONS.trophy,
    title: '5. Reach the objective',
    body: `The moment your cash hits $${OBJECTIVE_TARGET.toLocaleString()}, you're taken straight to a celebration screen. Hit Play Again to start a fresh run.`,
  },
];

function SectionHeading({ children }) {
  const { theme, spacing, typeScale } = useTheme();
  return (
    <Text style={[typeScale.h3, { color: theme.text, marginBottom: spacing.sm, marginTop: spacing.lg }]}>
      {children}
    </Text>
  );
}

export default function HowToPlayModal({ visible, onClose }) {
  const { theme, spacing, typeScale } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <Row justify="space-between" style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          <Text style={[typeScale.h1, { color: theme.text }]}>How to Play</Text>
          <Button
            title=""
            icon={<AppIcon entry={MISC_ICONS.close} size={18} color={theme.text} />}
            variant="secondary"
            fullWidth={false}
            size="sm"
            onPress={onClose}
          />
        </Row>

        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
          <Card
            entering={FadeInDown.duration(260)}
            style={{ backgroundColor: theme.accentSoft, borderTopColor: theme.accent, borderLeftColor: theme.accent, borderRightColor: theme.accent, borderBottomColor: theme.accentEdge, alignItems: 'center' }}
          >
            <AppIcon entry={MISC_ICONS.coin} size={28} color={theme.accent} />
            <Text style={[typeScale.h2, { color: theme.accent, marginTop: spacing.sm, textAlign: 'center' }]}>
              ${STARTING_CASH.toLocaleString()} → ${OBJECTIVE_TARGET.toLocaleString()}
            </Text>
            <Text style={[typeScale.body, { color: theme.text, marginTop: spacing.xs, textAlign: 'center' }]}>
              Buy resources, craft them into goods, sell the goods for a profit — until your cash hits the target.
            </Text>
          </Card>

          <SectionHeading>The loop</SectionHeading>
          <View style={{ gap: spacing.md }}>
            {STEPS.map((step, index) => (
              <Card key={step.title} entering={FadeInDown.delay(index * 60).duration(220)}>
                <Row gap="sm" align="flex-start">
                  <IconChip entry={step.icon} tone="primary" size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={[typeScale.bodyBold, { color: theme.text }]}>{step.title}</Text>
                    <Text style={[typeScale.body, { color: theme.textMuted, marginTop: spacing.xs }]}>{step.body}</Text>
                  </View>
                </Row>
              </Card>
            ))}
          </View>

          <SectionHeading>Resources (Market)</SectionHeading>
          <Card>
            {RESOURCE_IDS.map((id, index) => {
              const resource = RESOURCES[id];
              return (
                <Row
                  key={id}
                  justify="space-between"
                  style={{
                    paddingVertical: spacing.sm,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: theme.border,
                  }}
                >
                  <Row gap="sm">
                    <AppIcon entry={RESOURCE_ICONS[id]} size={18} color={theme.primary} />
                    <Text style={[typeScale.body, { color: theme.text }]}>{resource.name}</Text>
                  </Row>
                  <Text style={[typeScale.caption, { color: theme.textMuted }]}>
                    ${resource.price} each · {resource.startingStock} in stock
                  </Text>
                </Row>
              );
            })}
          </Card>

          <SectionHeading>Recipes (Production)</SectionHeading>
          <View style={{ gap: spacing.md }}>
            {RECIPE_IDS.map((id, index) => {
              const recipe = RECIPES[id];
              const inputSummary = Object.entries(recipe.inputs)
                .map(([resourceId, amount]) => `${amount} ${RESOURCES[resourceId].name}`)
                .join(' + ');
              return (
                <Card key={id} entering={FadeInDown.delay(index * 60).duration(220)}>
                  <Row justify="space-between">
                    <Row gap="sm">
                      <IconChip entry={GOOD_ICONS[id]} tone="primary" size={36} />
                      <Text style={[typeScale.bodyBold, { color: theme.text }]}>{recipe.name}</Text>
                    </Row>
                    <Text style={[typeScale.caption, { color: theme.textMuted }]}>
                      Yields {recipe.yield} · ${recipe.sellPrice}/ea
                    </Text>
                  </Row>
                  <Text style={[typeScale.body, { color: theme.textMuted, marginTop: spacing.xs }]}>{inputSummary}</Text>
                  <Row gap="sm" style={{ marginTop: spacing.xs }}>
                    <AppIcon entry={MISC_ICONS.clock} size={13} color={theme.accent} />
                    <Text style={[typeScale.caption, { color: theme.accent }]}>
                      {formatCountdown(recipe.craftTimeMs)} to manufacture · max {recipe.maxHeld} held at once
                    </Text>
                  </Row>
                </Card>
              );
            })}
          </View>

          <SectionHeading>Tips</SectionHeading>
          <Card>
            <Text style={[typeScale.body, { color: theme.textMuted }]}>
              • Stock never replenishes — a resource that sells out is gone for the rest of the run.{'\n\n'}
              • Different recipes have very different cost-to-yield ratios — it's worth comparing what a batch actually
              costs against what it sells for before committing scarce resources.{'\n\n'}
              • Only one batch can manufacture at a time across the whole game — buying, crafting, and selling are all
              paused until it finishes, so time your last batch before you plan to sell.{'\n\n'}
              • The Objective screen only shows goods you actually own — craft something in Production first if it looks
              empty.
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
