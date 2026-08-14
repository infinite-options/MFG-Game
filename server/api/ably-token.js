const Ably = require('ably');

// Vercel serverless function: the only place the real Ably API key is ever
// used. The Expo app never sees it — it calls this endpoint and gets back a
// short-lived, room-scoped token request instead.
//
// Deploy: set ABLY_API_KEY in Vercel's project environment variables (never
// commit it, never prefix it EXPO_PUBLIC_). Point the app's
// EXPO_PUBLIC_TOKEN_ENDPOINT_URL at this function's deployed URL.

const ROOM_CODE_PATTERN = /^[A-Z0-9]{4,8}$/;
const CLIENT_ID_PATTERN = /^p-[a-z0-9]{6,20}$/;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const clientId = String(req.query.clientId || '');
  const roomCode = String(req.query.roomCode || '').toUpperCase();

  if (!CLIENT_ID_PATTERN.test(clientId)) {
    res.status(400).json({ error: 'Invalid clientId' });
    return;
  }
  if (!ROOM_CODE_PATTERN.test(roomCode)) {
    res.status(400).json({ error: 'Invalid roomCode' });
    return;
  }

  if (!process.env.ABLY_API_KEY) {
    console.log("No ABLY_API_KEY found");
    console.error('Server misconfigured: ABLY_API_KEY not set');
    res.status(500).json({ error: 'Server misconfigured: ABLY_API_KEY not set' });
    return;
  }

  try {
    const rest = new Ably.Rest(process.env.ABLY_API_KEY);
    const tokenRequest = await rest.auth.createTokenRequest({
      clientId,
      capability: JSON.stringify({
        [`room:${roomCode}`]: ['publish', 'subscribe', 'presence', 'history'],
      }),
    });
    res.status(200).json(tokenRequest);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create token request' });
  }
};
