import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '../components/Card';
import Row from '../components/Row';
import Badge from '../components/Badge';
import Stepper from '../components/Stepper';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import IconChip from '../components/IconChip';
import { useTheme } from '../context/ThemeContext';
import { useGame, RESOURCES, RESOURCE_IDS } from '../context/GameContext';
import { useRoom } from '../context/RoomContext';
import { useToast } from '../context/ToastContext';
import { RESOURCE_ICONS } from '../constants/icons';

const EMPTY_CART = RESOURCE_IDS.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});

export default function MarketScreen() {
  const { theme, spacing, typeScale } = useTheme();
  const { state, buyResources, cartSubtotal, canAfford, isManufacturing } = useGame();
  const { roomPaused, raceEnded } = useRoom();
  const showToast = useToast();
  const [cart, setCart] = useState(EMPTY_CART);

  const total = cartSubtotal(cart);
  const hasItems = Object.values(cart).some((qty) => qty > 0);

  let inlineMessage = null;
  if (isManufacturing) {
    inlineMessage = 'Manufacturing in progress — please wait';
  } else if (raceEnded) {
    inlineMessage = 'The race has ended';
  } else if (roomPaused) {
    inlineMessage = 'Room paused — waiting for a player to reconnect';
  } else if (!hasItems) {
    inlineMessage = 'Add at least one item to your cart';
  } else if (!canAfford(total)) {
    inlineMessage = 'Not enough cash for this cart';
  }

  const handleGo = () => {
    const result = buyResources(cart);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      setCart(EMPTY_CART);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.background }}>
      <ScreenHeader
        title="Market"
        subtitle="Stock is limited and never restocks — buy wisely."
        style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, marginBottom: spacing.md }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.md }}
      >
        {RESOURCE_IDS.map((id) => {
          const resource = RESOURCES[id];
          const remainingStock = state.resources[id].remainingStock;
          const qty = cart[id];
          const subtotal = qty * resource.price;
          const soldOut = remainingStock <= 0;

          return (
            <Card key={id}>
              <Row justify="space-between" align="flex-start">
                <Row gap="sm">
                  <IconChip entry={RESOURCE_ICONS[id]} tone="primary" size={40} />
                  <View>
                    <Text style={[typeScale.bodyBold, { color: theme.text }]}>{resource.name}</Text>
                    <Text style={[typeScale.caption, { color: theme.textMuted, marginTop: 2 }]}>
                      ${resource.price} each
                    </Text>
                  </View>
                </Row>
                {soldOut ? (
                  <Badge label="Sold out" variant="danger" />
                ) : (
                  <Badge label={`${remainingStock} in stock`} variant="neutral" />
                )}
              </Row>

              <Row justify="space-between" style={{ marginTop: spacing.md }}>
                <Stepper value={qty} onChange={(v) => setCart((c) => ({ ...c, [id]: v }))} min={0} max={remainingStock} />
                <Text style={[typeScale.bodyBold, { color: theme.text }]}>${subtotal.toLocaleString()}</Text>
              </Row>
            </Card>
          );
        })}
      </ScrollView>

      <View
        style={{
          padding: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          backgroundColor: theme.surface,
        }}
      >
        <Row justify="space-between" style={{ marginBottom: spacing.sm }}>
          <Text style={[typeScale.h3, { color: theme.text }]}>Total</Text>
          <Text style={[typeScale.h3, { color: theme.text }]}>${total.toLocaleString()}</Text>
        </Row>
        {inlineMessage ? (
          <Text style={[typeScale.caption, { color: theme.danger, marginBottom: spacing.sm }]}>{inlineMessage}</Text>
        ) : null}
        <Button title="Go" onPress={handleGo} disabled={!!inlineMessage} />
      </View>
    </SafeAreaView>
  );
}
