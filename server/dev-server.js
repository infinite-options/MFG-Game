const fs = require('fs');
const path = require('path');
const http = require('http');
const { URL } = require('url');

const handler = require('./api/ably-token');

// Load server/.env manually — this project has no dotenv dependency.
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const PORT = process.env.PORT || 3001;

// Local-only stand-in for Vercel's serverless runtime: adapts plain Node
// req/res into the (req.query, res.status().json()) shape the handler in
// api/ably-token.js expects, so the exact same handler code runs here and
// in production later — nothing to rewrite when this eventually gets deployed.
const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host}`);
  req.query = Object.fromEntries(parsed.searchParams.entries());
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (body) {
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(body));
  };
  try {
    await handler(req, res);
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal error' }));
  }
});

server.listen(PORT, () => {
  console.log(`Ably token dev server: http://localhost:${PORT}/api/ably-token`);
});
