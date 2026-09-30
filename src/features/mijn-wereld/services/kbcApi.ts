// Client for the KBC Momentum backend at https://api.34-23-164-33.sslip.io (../backend, docs at /docs).
//
// That host sits behind the PoC site password (a cookie gate) and only allows CORS from
// https://34-23-164-33.sslip.io, so a browser page can't call it directly. On web the app calls /v1
// on its own origin instead, which is forwarded to the API: by nginx in the deployed PoC
// (poc-runner) and by the Metro dev proxy locally (metro.config.js). iOS/Android have no CORS and
// call the API directly; they pass the site gate with the same password before logging in.

import { Platform } from 'react-native';

import { clearSession, getSession, saveSession, type SessionUser } from '@/features/auth/session';

export const API_ORIGIN = 'https://api.34-23-164-33.sslip.io';
const DIRECT = Platform.OS !== 'web' || !!process.env.EXPO_PUBLIC_API_URL;

function baseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  return Platform.OS === 'web' ? '' : API_ORIGIN;
}

/** api.<domain> is guarded by <domain>/__login (poc-runner/deploy/Caddyfile). */
function gateUrl() {
  const url = new URL(baseUrl() || API_ORIGIN);
  return `${url.protocol}//${url.hostname.replace(/^api\./, '')}/__login`;
}

export class KbcApiError extends Error {
  constructor(
    public status: number,
    public code: string
  ) {
    super(`KBC API ${status}: ${code}`);
  }
}

// ---- Backend contract (Dutch field names, as in the backend) ----

export type Bron = 'EIGEN_AI' | 'DOCCLE' | 'GEOFENCE' | 'APP' | 'REKENING';
export type Fase = 'stil' | 'info' | 'vragen' | 'voorstel';

export interface KlantProfiel {
  id: string;
  naam: string;
  toestemming: Record<Bron, boolean>;
  producten: string[];
}

/** Moment as a customer sees it: privacy-filtered by the backend. */
export interface KlantMoment {
  moment: 'GEZINSUITBREIDING' | 'HUIS_KOPEN' | 'ZAAK_STARTEN';
  score: number;
  fase: Fase;
  bevestigd: boolean;
  acties: unknown[];
  waarom: string[];
  andereSignalen: number;
}

export interface MomentenResponse {
  week: number;
  momenten: KlantMoment[];
}

interface LoginResponse {
  token: string;
  expiresIn: number;
  user: SessionUser;
}

async function errorCode(res: Response) {
  try {
    return ((await res.json()) as { error?: string }).error ?? res.statusText;
  } catch {
    return res.statusText || 'network_error';
  }
}

/** The request ended on the site-password page instead of the API. */
const blockedByGate = (res: Response) => res.url.includes('/__login');

async function passGate(password: string) {
  const res = await fetch(gateUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `password=${encodeURIComponent(password)}&next=${encodeURIComponent(`${API_ORIGIN}/health`)}`,
    credentials: 'include',
  });
  if (blockedByGate(res)) throw new KbcApiError(401, 'gate_refused');
}

/** Logs a customer in and stores the token. */
export async function login(username: string, password: string) {
  let res: Response;
  try {
    // Native talks to the API host directly, so it must pass the site gate first (cookie is kept by the OS).
    if (DIRECT && !process.env.EXPO_PUBLIC_API_URL) await passGate(password);
    res = await fetch(`${baseUrl()}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });
  } catch (e) {
    if (e instanceof KbcApiError) throw e;
    throw new KbcApiError(0, 'network_error');
  }
  if (blockedByGate(res)) throw new KbcApiError(401, 'gate_refused');
  if (!res.ok) throw new KbcApiError(res.status, await errorCode(res));

  const body = (await res.json()) as LoginResponse;
  if (body.user.role !== 'klant' || !body.user.klantId) throw new KbcApiError(403, 'not_a_customer');
  await saveSession({ token: body.token, user: body.user, expiresAt: Date.now() + body.expiresIn * 1000 });
  return body.user;
}

export async function kbcRequest<T>(method: 'GET' | 'POST' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const session = getSession();
  if (!session) throw new KbcApiError(401, 'unauthorized');

  const res = await fetch(`${baseUrl()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${session.token}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
  });
  // Expired or rejected token (or the site gate expired): back to the login screen.
  if (res.status === 401 || blockedByGate(res)) {
    await clearSession();
    throw new KbcApiError(401, 'unauthorized');
  }
  if (!res.ok) throw new KbcApiError(res.status, await errorCode(res));
  return (await res.json()) as T;
}

/** The logged-in customer's id. Never hardcode customer ids (backend AGENTS.md). */
export function currentKlantId() {
  const klantId = getSession()?.user.klantId;
  if (!klantId) throw new KbcApiError(401, 'unauthorized');
  return klantId;
}
