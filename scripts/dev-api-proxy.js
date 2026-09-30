// Dev-only: forwards /v1/* and /health from the Metro dev server to the KBC Momentum backend,
// like nginx does in the deployed PoC (poc-runner/docker/spa.nginx.conf). The app keeps calling
// its own origin, so there is no CORS and no API URL in the bundle.
//
// .env.local (never committed):
//   KBC_API_TARGET=https://api.34-23-164-33.sslip.io   (default; or http://127.0.0.1:3000 for ../backend)
//   KBC_GATE_PASSWORD=...                               (the shared site password in front of the VM)
// The gate cookie stays in this Node process; it never reaches the browser.

const TARGET = (process.env.KBC_API_TARGET || 'https://api.34-23-164-33.sslip.io').replace(/\/$/, '');
const GATE_PASSWORD = process.env.KBC_GATE_PASSWORD;

/** api.<domain> is guarded by the gate on <domain>/__login (poc-runner/deploy/Caddyfile). */
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
    if (!path.startsWith('/v1/') && path !== '/health') return next();

    try {
      const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await readBody(req);
      const forward = () => {
        const headers = {};
        for (const h of ['content-type', 'authorization', 'accept']) {
          if (req.headers[h]) headers[h] = req.headers[h];
        }
        if (gateCookie) headers.cookie = gateCookie;
        return fetch(`${TARGET}${path}`, { method: req.method, headers, body, redirect: 'manual' });
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
          message: `${TARGET} is behind the PoC site password. Set KBC_GATE_PASSWORD in .env.local and restart Expo.`,
        });
      }

      res.statusCode = upstream.status;
      const type = upstream.headers.get('content-type');
      if (type) res.setHeader('content-type', type);
      res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch (e) {
      sendJson(res, 502, { error: 'proxy_error', message: e instanceof Error ? e.message : String(e) });
    }
  };
}

module.exports = { createApiProxy, API_TARGET: TARGET };
