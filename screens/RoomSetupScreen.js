import React, { useEffect, useState } from 'react';
import { Text, TextInput } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Button from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { useRoom } from '../context/RoomContext';
import { useToast } from '../context/ToastContext';
import { getSavedPlayerName, savePlayerName } from '../utils/playerIdentity';

export default function RoomSetupScreen({ navigation }) {
  const { theme, spacing, radii, typeScale } = useTheme();
  const { createRoom, joinRoom } = useRoom();
  const showToast = useToast();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSavedPlayerName().then((saved) => {
      if (saved) setName(saved);
    });
  }, []);

  const inputStyle = [
    typeScale.body,
    {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: radii.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      color: theme.text,
      backgroundColor: theme.surface,
    },
  ];

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Enter a display name', 'error');
      return;
    }
    setBusy(true);
    await savePlayerName(trimmed);
    const result = await createRoom(trimmed);
    setBusy(false);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) navigation.navigate('Lobby');
  };

  const handleJoin = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Enter a display name', 'error');
      return;
    }
    if (!code.trim()) {
      showToast('Enter a room code', 'error');
      return;
    }
    setBusy(true);
    const result = await joinRoom(code, { name: trimmed });
    setBusy(false);
    if (result.success) await savePlayerName(trimmed);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) navigation.navigate('Lobby');
  };

  return (
    <ScreenContainer title="Multiplayer" subtitle="Create a room or join one with a code.">
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={[typeScale.caption, { color: theme.textMuted, marginBottom: spacing.xs }]}>YOUR NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Sam"
          placeholderTextColor={theme.textMuted}
          maxLength={20}
          style={inputStyle}
        />
      </Card>

      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={[typeScale.h3, { color: theme.text, marginBottom: spacing.sm }]}>Create a room</Text>
        <Text style={[typeScale.body, { color: theme.textMuted, marginBottom: spacing.md }]}>
          You'll get a room code to share with 1-3 friends.
        </Text>
        <Button title="Create Room" onPress={handleCreate} disabled={busy} />
      </Card>

      <Card>
        <Text style={[typeScale.h3, { color: theme.text, marginBottom: spacing.sm }]}>Join a room</Text>
        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase())}
          placeholder="ROOM CODE"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="characters"
          maxLength={8}
          style={[inputStyle, { marginBottom: spacing.md, letterSpacing: 2, textAlign: 'center' }]}
        />
        <Button title="Join Room" variant="secondary" onPress={handleJoin} disabled={busy} />
      </Card>
    </ScreenContainer>
  );
}
