import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYER_ID_KEY = 'resourceco.playerId';
const PLAYER_NAME_KEY = 'resourceco.playerName';

// Not cryptographically secure — doesn't need to be, this only needs to be
// unique enough to tell players apart within a 2-4 person room. Avoids
// depending on a native crypto global that isn't guaranteed present on RN.
function generateId() {
  return 'p-' + Array.from({ length: 12 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
}

// Persisted across app restarts so a reconnecting player is recognized as
// the same participant (Ably Presence keys off this id), not a new joiner.
export async function getOrCreatePlayerId() {
  const existing = await AsyncStorage.getItem(PLAYER_ID_KEY);
  if (existing) return existing;
  const id = generateId();
  await AsyncStorage.setItem(PLAYER_ID_KEY, id);
  return id;
}

export async function getSavedPlayerName() {
  return AsyncStorage.getItem(PLAYER_NAME_KEY);
}

export async function savePlayerName(name) {
  await AsyncStorage.setItem(PLAYER_NAME_KEY, name);
}
