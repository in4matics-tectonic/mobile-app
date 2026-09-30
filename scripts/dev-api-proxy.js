// Dev-only: forwards requests from the Metro dev server to the PoC services, like nginx does in the
// deployed PoC (poc-runner/docker/spa.nginx.conf). The app keeps calling its own origin, so there is
// no CORS and no API URL in the bundle.
//
//   /v1/*, /health               → backend      (KBC_API_TARGET)
//   /kate-chat/*, /api/*, /vendor/* → Kate chat (KATE_CHAT_TARGET), so the chat can be embedded
//                                   same-origin in the app (see src/features/kate-chat)
//
// .env.local (never committed):
//   KBC_API_TARGET=https://api.34-23-164-33.sslip.io   (default; or http://127.0.0.1:3000 for ../backend)
//   KATE_CHAT_TARGET=https://chat.34-23-164-33.sslip.io (default: derived from KBC_API_TARGET)
//   KBC_GATE_PASSWORD=...                               (the shared site password in front of the VM)
// The gate cookie stays in this Node process; it never reaches the browser.

const { Buffer } = require('node:buffer');

const TARGET = (process.env.KBC_API_TARGET || 'https://api.34-23-164-33.sslip.io').replace(/\/$/, '');
const GATE_PASSWORD = process.env.KBC_GATE_PASSWORD;

/** chat.<domain> next to api.<domain> on the VM; the poc-runner chat port when running locally. */
function chatTarget() {
  if (process.env.KATE_CHAT_TARGET) return process.env.KATE_CHAT_TARGET.replace(/\/$/, '');
  const url = new URL(TARGET);
  return url.hostname.startsWith('api.')
    ? `${url.protocol}//${url.hostname.replace(/^api\./, 'chat.')}`
    : 'http://127.0.0.1:7003';
}
const CHAT_TARGET = chatTarget();

/** Which requests go where, which headers they may carry, and how the path is rewritten. */
const ROUTES = [
  {
    match: (path) => path.startsWith('/v1/') || path === '/health',
    target: TARGET,
    headers: ['content-type', 'authorization', 'accept'],
    rewrite: (path) => path,
  },
  {
    // The chat page itself lives at /kate-chat/; its scripts and API calls use absolute /api and /vendor paths.
    match: (path) => /^\/kate-chat(\/|\?|$)/.test(path) || path.startsWith('/api/') || path.startsWith('/vendor/'),
    target: CHAT_TARGET,
    headers: ['content-type', 'accept', 'x-session'],
    rewrite: (path) => path.replace(/^\/kate-chat\/?/, '/'),
  },
];

/** The VM hosts are guarded by the gate on <domain>/__login (poc-runner/deploy/Caddyfile). */
function gateLoginUrl() {
  if (process.env.KBC_GATE_URL) return process.env.KBC_GATE_URL;
  const url = new URL(TARGET);
  return `${url.protocol}//${url.hostname.replace(/^api\./, '')}/__login`;
}

let gateCookie = null;
let gateLogin = null;

async function loginGate() {
  const res = await fetch(gateLoginUrl(), {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ password: GATE_PASSWORD, next: `${TARGET}/health` }),
    redirect: 'manual',
  });
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .find((c) => c.startsWith('poc_gate='));
  if (!cookie) throw new Error(`Gate login failed (HTTP ${res.status}). Check KBC_GATE_PASSWORD.`);
  return cookie;
}

function refreshGateCookie() {
  gateLogin ??= loginGate()
    .then((cookie) => (gateCookie = cookie))
    .finally(() => (gateLogin = null));
  return gateLogin;
}

const blockedByGate = (res) =>
  res.status >= 300 && res.status < 400 && (res.headers.get('location') || '').includes('/__login');

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

function createApiProxy() {
  return async function apiProxy(req, res, next) {
    const path = req.url || '';
    const route = ROUTES.find((r) => r.match(path));
    if (!route) return next();

    try {
      const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await readBody(req);
      const forward = () => {
        const headers = {};
        for (const h of route.headers) {
          if (req.headers[h]) headers[h] = req.headers[h];
        }
        if (gateCookie) headers.cookie = gateCookie;
        return fetch(`${route.target}${route.rewrite(path)}`, { method: req.method, headers, body, redirect: 'manual' });
      };

      if (GATE_PASSWORD && !gateCookie) await refreshGateCookie();
      let upstream = await forward();
      // The gate cookie expired: log in to the gate again and retry once.
      if (blockedByGate(upstream) && GATE_PASSWORD) {
        await refreshGateCookie();
        upstream = await forward();
      }
      if (blockedByGate(upstream)) {
        return sendJson(res, 502, {
          error: 'gate_blocked',
          message: `${route.target} is behind the PoC site password. Set KBC_GATE_PASSWORD in .env.local and restart Expo.`,
        });
      }

      res.statusCode = upstream.status;
      for (const h of ['content-type', 'cache-control']) {
        const value = upstream.headers.get(h);
        if (value) res.setHeader(h, value);
      }
      res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch (e) {
      sendJson(res, 502, { error: 'proxy_error', message: e instanceof Error ? e.message : String(e) });
    }
  };
}

module.exports = { createApiProxy, API_TARGET: TARGET, CHAT_TARGET };
