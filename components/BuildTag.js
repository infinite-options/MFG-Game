import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useRoom } from '../context/RoomContext';
import { BUILD_VERSION } from '../constants/buildInfo';

export default function BuildTag() {
  const { theme, typeScale } = useTheme();
  const { ablyKeyName } = useRoom();
  // Only the appId.keyId half of the Ably key, not the secret half — see the
  // ablyKeyName comment in RoomContext for why that's safe to show here.
  const keyTail = ablyKeyName ? ablyKeyName.slice(-4) : null;

  return (
    <Text pointerEvents="none" style={[typeScale.caption, styles.tag, { color: theme.textMuted }]}>
      Version {BUILD_VERSION}
      {keyTail ? ` · Key ...${keyTail}` : ''}
    </Text>
  );
}

const styles = StyleSheet.create({
  tag: { textAlign: 'center', paddingVertical: 4 },
});
