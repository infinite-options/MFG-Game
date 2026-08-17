import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Ably from 'ably';

import { useGame } from './GameContext';
import { getOrCreatePlayerId } from '../utils/playerIdentity';
import { generateRoomCode, isValidRoomCode, normalizeRoomCode } from '../utils/roomCode';

// Multiplayer is a strictly additive layer: this file only ever *reads*
// useGame()'s state (cash, hasWon) to broadcast it — with one deliberate
// exception, resetGame() at race start (see applyRaceStart below), so every
// player begins a race from the same $100 baseline instead of carrying over
// leftover cash from a previous game. It never touches game logic beyond
// that single, well-defined action. Solo mode never touches this file's code
// paths at all.
//
// Trust model, deliberately accepted: there is no shared backend simulating
// anyone's economy, so a tampered client could broadcast a fabricated cash
// or hasWon value with nothing here to stop it. Fixing that would require
// moving the simulation server-side, which was explicitly ruled out in favor
// of "independent economies, no shared backend." Fine for a casual game
// among friends — flagged here so it's never mistaken for an oversight.

const MAX_PLAYERS = 4;
const MIN_PLAYERS_TO_START = 2;
const SNAPSHOT_THROTTLE_MS = 1500;
const TOKEN_ENDPOINT_URL = process.env.EXPO_PUBLIC_TOKEN_ENDPOINT_URL;

const initialRoomState = {
  roomCode: null,
  players: {}, // id -> { id, name, cash, hasWon, joinedAt, present }
  expectedIds: null, // Set<id> captured at race start, or null before start
  raceStarted: false,
  raceEnded: false,
  winnerId: null,
};

function channelNameFor(roomCode) {
  return `room:${roomCode}`;
}

const RoomContext = createContext(null);

export function RoomProvider({ children }) {
  const game = useGame();

  const clientRef = useRef(null);
  const channelRef = useRef(null);
  const currentRoomCodeRef = useRef(null);
  const myIdRef = useRef(null);
  const myNameRef = useRef('Player');
  const hasPublishedWinRef = useRef(false);
  const raceStartAppliedRef = useRef(false);
  const lastSnapshotAtRef = useRef(0);
  const pendingSnapshotTimeoutRef = useRef(null);

  const [inRoom, setInRoom] = useState(false);
  const [connectionState, setConnectionState] = useState('initialized');
  const [room, setRoom] = useState(initialRoomState);
  // keyName is the appId.keyId portion of the Ably API key, returned as part
  // of every token exchange — unlike the key's secret half, it's meant to be
  // client-visible, so it's safe to surface (see BuildTag) for eyeballing
  // which Ably key/environment a running instance is actually talking to.
  const [ablyKeyName, setAblyKeyName] = useState(null);

  useEffect(() => {
    getOrCreatePlayerId().then((id) => {
      myIdRef.current = id;
    });
  }, []);

  // Mirrors game.state.cash/hasWon into a ref so the request_snapshot responder
  // below (an Ably subscription callback, not a render) always publishes the
  // current value instead of whatever was in scope when attachSubscriptions ran.
  const gameStateRef = useRef({ cash: game.state.cash, hasWon: game.state.hasWon });
  useEffect(() => {
    gameStateRef.current = { cash: game.state.cash, hasWon: game.state.hasWon };
  }, [game.state.cash, game.state.hasWon]);

  const applyPresenceSet = useCallback((members) => {
    setRoom((r) => {
      const players = { ...r.players };
      const presentIds = new Set();
      members.forEach((m) => {
        presentIds.add(m.clientId);
        const existing = players[m.clientId];
        players[m.clientId] = {
          id: m.clientId,
          name: (m.data && m.data.name) || (existing && existing.name) || 'Player',
          cash: existing ? existing.cash : 0,
          hasWon: existing ? existing.hasWon : false,
          joinedAt: m.timestamp,
          present: true,
        };
      });
      Object.keys(players).forEach((id) => {
        if (!presentIds.has(id)) {
          players[id] = { ...players[id], present: false };
        }
      });
      return { ...r, players };
    });
  }, []);

  const getOrCreateClient = useCallback(async () => {
    if (clientRef.current) return clientRef.current;
    if (!myIdRef.current) {
      myIdRef.current = await getOrCreatePlayerId();
    }
    const client = new Ably.Realtime({
      clientId: myIdRef.current,
      // Default is 15s before an abrupt drop triggers a presence 'leave' —
      // tuned down so the room's paused state feels responsive rather than
      // leaving everyone staring at a frozen screen wondering what happened.
      transportParams: { remainPresentFor: 6000 },
      authCallback: (tokenParams, callback) => {
        if (!TOKEN_ENDPOINT_URL) {
          callback('Multiplayer is not configured: missing token endpoint', null);
          return;
        }
        const roomCode = currentRoomCodeRef.current;
        const url = `${TOKEN_ENDPOINT_URL}?clientId=${encodeURIComponent(myIdRef.current)}&roomCode=${encodeURIComponent(roomCode || '')}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        fetch(url, { signal: controller.signal })
          .then((res) => {
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(`Token endpoint returned ${res.status}`);
            return res.json();
          })
          .then((tokenRequest) => {
            if (tokenRequest && tokenRequest.keyName) setAblyKeyName(tokenRequest.keyName);
            callback(null, tokenRequest);
          })
          .catch((err) => {
            clearTimeout(timeoutId);
            callback(err.message || 'Failed to fetch Ably token', null);
          });
      },
    });
    client.connection.on((stateChange) => setConnectionState(stateChange.current));
    clientRef.current = client;
    return client;
  }, []);

  const detachCurrentChannel = useCallback(() => {
    const channel = channelRef.current;
    if (channel) {
      channel.unsubscribe();
      channel.presence.unsubscribe();
      channel.detach().catch(() => {});
    }
    channelRef.current = null;
  }, []);

  const resetRoomState = useCallback(() => {
    setInRoom(false);
    setRoom(initialRoomState);
    hasPublishedWinRef.current = false;
    raceStartAppliedRef.current = false;
    currentRoomCodeRef.current = null;
  }, []);

  // Applying race_start is idempotent and shared between the live subscription
  // and history replay after reconnecting (see the AppState effect below) —
  // both can observe the same message, and resetGame() must only ever fire once.
  const applyRaceStart = useCallback(
    (expectedIds) => {
      if (raceStartAppliedRef.current) return;
      raceStartAppliedRef.current = true;
      setRoom((r) => ({ ...r, raceStarted: true, expectedIds: new Set(expectedIds) }));
      game.resetGame();
    },
    [game.resetGame]
  );

  const applyPlayerWon = useCallback((id) => {
    setRoom((r) => {
      if (r.winnerId) return r; // first message in delivered order wins, ignore the rest
      return { ...r, winnerId: id, raceEnded: true };
    });
  }, []);

  const applyPlayerLeft = useCallback((id) => {
    setRoom((r) => {
      if (!r.expectedIds) return r;
      const nextExpected = new Set(r.expectedIds);
      nextExpected.delete(id);
      const players = { ...r.players };
      delete players[id];
      return { ...r, expectedIds: nextExpected, players };
    });
  }, []);

  const attachSubscriptions = useCallback(
    (channel) => {
      channel.subscribe('player_snapshot', (msg) => {
        const { id, cash, hasWon } = msg.data;
        setRoom((r) => ({
          ...r,
          players: {
            ...r.players,
            [id]: { ...(r.players[id] || { name: 'Player', present: true, joinedAt: Date.now() }), id, cash, hasWon },
          },
        }));
      });

      channel.subscribe('player_won', (msg) => applyPlayerWon(msg.data.id));
      channel.subscribe('player_left', (msg) => applyPlayerLeft(msg.data.id));
      channel.subscribe('race_start', (msg) => applyRaceStart(msg.data.expectedIds));

      // A newly-joined or just-reconnected client has no way to learn
      // existing players' real cash — presence only carries identity, and
      // each client's own snapshot publish (below) only reaches whoever was
      // already subscribed at that moment. So latecomers ask, and everyone
      // else answers with their current value from gameStateRef.
      channel.subscribe('request_snapshot', (msg) => {
        if (msg.data.id === myIdRef.current) return;
        channel.publish('player_snapshot', {
          id: myIdRef.current,
          cash: gameStateRef.current.cash,
          hasWon: gameStateRef.current.hasWon,
        });
      });

      channel.presence.subscribe(['enter', 'update', 'leave'], async () => {
        try {
          const members = await channel.presence.get();
          applyPresenceSet(members);
        } catch (e) {
          // transient — the next presence event or reconnect resync will catch it up
        }
      });
    },
    [applyPresenceSet, applyPlayerWon, applyPlayerLeft, applyRaceStart]
  );

  const joinRoom = useCallback(
    async (rawCode, { asHost = false, name } = {}) => {
      const code = normalizeRoomCode(rawCode);
      if (!isValidRoomCode(code)) {
        return { success: false, message: 'Enter a valid room code' };
      }
      if (!TOKEN_ENDPOINT_URL) {
        return { success: false, message: 'Multiplayer isn’t set up yet — no token server configured' };
      }
      if (name) myNameRef.current = name;

      detachCurrentChannel();
      currentRoomCodeRef.current = code;

      try {
        const client = await getOrCreateClient();
        await client.auth.authorize();
        const channel = client.channels.get(channelNameFor(code));
        await channel.attach();

        if (!asHost) {
          const existingMembers = await channel.presence.get();
          if (existingMembers.length === 0) {
            return { success: false, message: 'Room not found' };
          }
          if (existingMembers.length >= MAX_PLAYERS) {
            return { success: false, message: 'Room is full' };
          }
          const history = await channel.history({ direction: 'backwards', limit: 50 });
          const alreadyStarted = history.items.some((m) => m.name === 'race_start');
          if (alreadyStarted) {
            return { success: false, message: 'Race already in progress in this room' };
          }
        }

        attachSubscriptions(channel);
        await channel.presence.enter({ name: myNameRef.current });
        const members = await channel.presence.get();
        channelRef.current = channel;
        applyPresenceSet(members);
        // Ask whoever's already here for their real cash — presence alone
        // only tells us who's present, not what they've earned.
        channel.publish('request_snapshot', { id: myIdRef.current }).catch(() => {});
        setRoom((r) => ({ ...initialRoomState, roomCode: code, players: r.players }));
        setInRoom(true);
        return { success: true, message: asHost ? `Room ${code} created` : `Joined room ${code}` };
      } catch (err) {
        currentRoomCodeRef.current = null;
        return { success: false, message: 'Could not connect — check your connection and try again' };
      }
    },
    [applyPresenceSet, attachSubscriptions, detachCurrentChannel, getOrCreateClient]
  );

  const createRoom = useCallback(
    (name) => {
      const code = generateRoomCode();
      return joinRoom(code, { asHost: true, name });
    },
    [joinRoom]
  );

  const leaveRoom = useCallback(async () => {
    const channel = channelRef.current;
    if (channel) {
      try {
        await channel.publish('player_left', { id: myIdRef.current });
        await channel.presence.leave();
      } catch (e) {
        // best-effort — resetting local state below regardless
      }
    }
    detachCurrentChannel();
    resetRoomState();
  }, [detachCurrentChannel, resetRoomState]);

  const players = useMemo(() => Object.values(room.players).sort((a, b) => b.cash - a.cash), [room.players]);

  const hostId = useMemo(() => {
    const present = players.filter((p) => p.present);
    if (present.length === 0) return null;
    return present.reduce((earliest, p) => (p.joinedAt < earliest.joinedAt ? p : earliest)).id;
  }, [players]);

  const isHost = !!myIdRef.current && hostId === myIdRef.current;

  const roomPaused = useMemo(() => {
    if (!room.raceStarted || room.raceEnded || !room.expectedIds) return false;
    for (const id of room.expectedIds) {
      const p = room.players[id];
      if (!p || !p.present) return true;
    }
    return false;
  }, [room.raceStarted, room.raceEnded, room.expectedIds, room.players]);

  const missingPlayers = useMemo(() => {
    if (!roomPaused || !room.expectedIds) return [];
    return [...room.expectedIds]
      .filter((id) => !room.players[id] || !room.players[id].present)
      .map((id) => (room.players[id] ? room.players[id].name : 'A player'));
  }, [roomPaused, room.expectedIds, room.players]);

  const startRace = useCallback(() => {
    const channel = channelRef.current;
    if (!channel || !isHost) {
      return { success: false, message: 'Only the host can start the race' };
    }
    const expectedIds = players.filter((p) => p.present).map((p) => p.id);
    if (expectedIds.length < MIN_PLAYERS_TO_START) {
      return { success: false, message: `Need at least ${MIN_PLAYERS_TO_START} players to start` };
    }
    channel.publish('race_start', { expectedIds });
    return { success: true, message: 'Race started!' };
  }, [isHost, players]);

  const continueWithoutPlayer = useCallback(
    (id) => {
      channelRef.current?.publish('player_left', { id });
    },
    []
  );

  // Publish this player's own progress. Throttled with a trailing flush so
  // the leaderboard doesn't visibly jitter on every single buy/craft/sell tap.
  useEffect(() => {
    if (!inRoom || !channelRef.current) return;
    const channel = channelRef.current;
    const cash = game.state.cash;
    const hasWon = game.state.hasWon;

    const publish = () => {
      lastSnapshotAtRef.current = Date.now();
      channel.publish('player_snapshot', { id: myIdRef.current, cash, hasWon });
    };

    const elapsed = Date.now() - lastSnapshotAtRef.current;
    if (pendingSnapshotTimeoutRef.current) clearTimeout(pendingSnapshotTimeoutRef.current);
    if (elapsed >= SNAPSHOT_THROTTLE_MS) {
      publish();
    } else {
      pendingSnapshotTimeoutRef.current = setTimeout(publish, SNAPSHOT_THROTTLE_MS - elapsed);
    }

    if (hasWon && !hasPublishedWinRef.current) {
      hasPublishedWinRef.current = true;
      channel.publish('player_won', { id: myIdRef.current });
    }

    return () => {
      if (pendingSnapshotTimeoutRef.current) clearTimeout(pendingSnapshotTimeoutRef.current);
    };
  }, [inRoom, game.state.cash, game.state.hasWon]);

  // RN suspends the JS runtime while backgrounded; Ably's own reconnect can't
  // be assumed to have kept up. On foreground return: reconnect if needed,
  // re-enter presence defensively (a long suspension can silently drop our
  // own entry, making everyone else see US as the missing player), refresh
  // the live presence set, and replay recent channel history to catch up on
  // race_start/player_won/player_left messages that arrived while this
  // device couldn't receive live events at all.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const client = clientRef.current;
      const channel = channelRef.current;
      if (!client || !channel) return;
      if (client.connection.state === 'suspended' || client.connection.state === 'disconnected') {
        client.connection.connect();
      }
      (async () => {
        try {
          await channel.presence.enter({ name: myNameRef.current });
        } catch (e) {
          // already present, or connection not ready yet — harmless either way
        }
        try {
          const members = await channel.presence.get();
          applyPresenceSet(members);
        } catch (e) {
          // next presence event or the history replay below will catch it up
        }
        try {
          // History replay below only covers race_start/player_won/player_left —
          // cash can have changed for everyone else during the time this device
          // couldn't receive live events, so re-request current snapshots too.
          await channel.publish('request_snapshot', { id: myIdRef.current });
        } catch (e) {
          // best-effort — the next live snapshot from any player will still arrive normally
        }
        try {
          const history = await channel.history({ direction: 'forwards', limit: 100 });
          history.items.forEach((item) => {
            if (item.name === 'race_start') applyRaceStart(item.data.expectedIds);
            else if (item.name === 'player_won') applyPlayerWon(item.data.id);
            else if (item.name === 'player_left') applyPlayerLeft(item.data.id);
          });
        } catch (e) {
          // best-effort catch-up — live events from here on will still arrive normally
        }
      })();
    });
    return () => sub.remove();
  }, [applyPresenceSet, applyRaceStart, applyPlayerWon, applyPlayerLeft]);

  const value = useMemo(
    () => ({
      inRoom,
      connectionState,
      roomCode: room.roomCode,
      myId: myIdRef.current,
      isHost,
      hostId,
      players,
      raceStarted: room.raceStarted,
      raceEnded: room.raceEnded,
      winnerId: room.winnerId,
      roomPaused,
      missingPlayers,
      ablyKeyName,
      createRoom,
      joinRoom,
      leaveRoom,
      startRace,
      continueWithoutPlayer,
    }),
    [
      inRoom,
      connectionState,
      room.roomCode,
      isHost,
      hostId,
      players,
      room.raceStarted,
      room.raceEnded,
      room.winnerId,
      roomPaused,
      missingPlayers,
      ablyKeyName,
      createRoom,
      joinRoom,
      leaveRoom,
      startRace,
      continueWithoutPlayer,
    ]
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoom must be used within a RoomProvider');
  return ctx;
}
