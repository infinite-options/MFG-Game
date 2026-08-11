import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// Every place a resource/good/tab appears in the UI pulls its icon from here,
// so the same glyph is used consistently everywhere that item shows up.

export const RESOURCE_ICONS = {
  labor: { Component: Feather, name: 'user' },
  wood: { Component: MaterialCommunityIcons, name: 'tree' },
  metal: { Component: MaterialCommunityIcons, name: 'anvil' },
  cloth: { Component: MaterialCommunityIcons, name: 'texture-box' },
};

export const GOOD_ICONS = {
  cars: { Component: MaterialCommunityIcons, name: 'car' },
  furniture: { Component: MaterialCommunityIcons, name: 'sofa' },
  clothes: { Component: MaterialCommunityIcons, name: 'tshirt-crew' },
  houses: { Component: MaterialCommunityIcons, name: 'home-city' },
};

export const TAB_ICONS = {
  Home: { Component: Feather, name: 'home' },
  Market: { Component: Feather, name: 'shopping-cart' },
  Production: { Component: Feather, name: 'tool' },
  Inventory: { Component: Feather, name: 'archive' },
  Objective: { Component: Feather, name: 'target' },
  Results: { Component: Feather, name: 'flag' },
};

export const MISC_ICONS = {
  success: { Component: Feather, name: 'check-circle' },
  error: { Component: Feather, name: 'alert-circle' },
  plus: { Component: Feather, name: 'plus' },
  minus: { Component: Feather, name: 'minus' },
  trendingUp: { Component: Feather, name: 'trending-up' },
  clock: { Component: Feather, name: 'clock' },
  lock: { Component: Feather, name: 'lock' },
  coin: { Component: MaterialCommunityIcons, name: 'poker-chip' },
  trophy: { Component: MaterialCommunityIcons, name: 'trophy-award' },
  emptyChest: { Component: MaterialCommunityIcons, name: 'treasure-chest' },
  dice: { Component: MaterialCommunityIcons, name: 'dice-multiple' },
  help: { Component: Feather, name: 'help-circle' },
  close: { Component: Feather, name: 'x' },
  person: { Component: Feather, name: 'user' },
  people: { Component: Feather, name: 'users' },
  copy: { Component: Feather, name: 'copy' },
  leave: { Component: Feather, name: 'log-out' },
  offline: { Component: Feather, name: 'wifi-off' },
  crown: { Component: MaterialCommunityIcons, name: 'crown' },
  paused: { Component: MaterialCommunityIcons, name: 'pause-circle-outline' },
};

// Convenience: render any registry entry as a component.
export function AppIcon({ entry, size = 20, color }) {
  const { Component, name } = entry;
  return <Component name={name} size={size} color={color} />;
}
