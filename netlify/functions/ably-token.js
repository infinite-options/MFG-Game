const Ably = require('ably');

// Netlify Function equivalent of server/api/ably-token.js — same logic,
// adapted to Netlify's (event, context) -> { statusCode, body } handler
// shape instead of Vercel's (req, res). Deploys on the same Netlify site as
// the app itself, so no second hosting provider is needed.
//
// Set ABLY_API_KEY in Netlify's Site settings -> Environment variables.
// This function is reachable at /.netlify/functions/ably-token once deployed
// (Netlify also lets you add a redirect to shorten this to /api/ably-token
// via netlify.toml, but the raw path works without any extra config).

const ROOM_CODE_PATTERN = /^[A-Z0-9]{4,8}$/;
const CLIENT_ID_PATTERN = /^p-[a-z0-9]{6,20}$/;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const params = event.queryStringParameters || {};
  const clientId = String(params.clientId || '');
  const roomCode = String(params.roomCode || '').toUpperCase();

  if (!CLIENT_ID_PATTERN.test(clientId)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid clientId' }) };
  }
  if (!ROOM_CODE_PATTERN.test(roomCode)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid roomCode' }) };
  }
  if (!process.env.ABLY_API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server misconfigured: ABLY_API_KEY not set' }),
    };
  }

  try {
    const rest = new Ably.Rest(process.env.ABLY_API_KEY);
    const tokenRequest = await rest.auth.createTokenRequest({
      clientId,
      capability: JSON.stringify({
        [`room:${roomCode}`]: ['publish', 'subscribe', 'presence', 'history'],
      }),
    });
    return { statusCode: 200, headers, body: JSON.stringify(tokenRequest) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to create token request' }) };
  }
};
