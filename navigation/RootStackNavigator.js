import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ModeSelectScreen from '../screens/ModeSelectScreen';
import RoomSetupScreen from '../screens/RoomSetupScreen';
import LobbyScreen from '../screens/LobbyScreen';
import RootTabNavigator from './RootTabNavigator';

const Stack = createNativeStackNavigator();

export default function RootStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ModeSelect" component={ModeSelectScreen} />
      <Stack.Screen name="RoomSetup" component={RoomSetupScreen} />
      <Stack.Screen name="Lobby" component={LobbyScreen} options={{ gestureEnabled: false }} />
      {/* gestureEnabled: false — leaving mid-race must go through the explicit
          Leave action (which tells the room), not an accidental swipe-back. */}
      <Stack.Screen name="InRace" component={RootTabNavigator} options={{ gestureEnabled: false }} />
    </Stack.Navigator>
  );
}
