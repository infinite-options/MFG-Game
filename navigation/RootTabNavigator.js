import React, { useEffect } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { TAB_ICONS, AppIcon } from '../constants/icons';

import HomeScreen from '../screens/HomeScreen';
import MarketScreen from '../screens/MarketScreen';
import ProductionScreen from '../screens/ProductionScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ObjectiveScreen from '../screens/ObjectiveScreen';
import ResultsScreen from '../screens/ResultsScreen';

const Tab = createBottomTabNavigator();

function AnimatedTabIcon({ entry, color, size, focused }) {
  const { theme, radii } = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(1.22, { damping: 7, stiffness: 320 }),
        withSpring(1, { damping: 9, stiffness: 260 })
      );
    }
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View
      style={{
        width: 44,
        height: 30,
        borderRadius: radii.pill,
        backgroundColor: focused ? theme.primarySoft : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View style={animatedStyle}>
        <AppIcon entry={entry} size={size} color={color} />
      </Animated.View>
    </View>
  );
}

export default function RootTabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 64,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ focused, color, size }) => (
          <AnimatedTabIcon entry={TAB_ICONS[route.name]} color={color} size={size} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Market" component={MarketScreen} />
      <Tab.Screen name="Production" component={ProductionScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Objective" component={ObjectiveScreen} />
      <Tab.Screen name="Results" component={ResultsScreen} />
    </Tab.Navigator>
  );
}
