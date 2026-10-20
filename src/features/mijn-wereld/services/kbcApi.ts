// Client for the KBC Momentum backend on the PoC VM, api.<domain> (../backend, docs at /docs).
// The VM's domain is in src/constants/poc-vm.json: change it there when the VM moves.
//
// That host sits behind the PoC site password (a cookie gate) and only allows CORS from
// https://<domain>, so a browser page can't call it directly. On web the app calls /v1
// on its own origin instead, which is forwarded to the API: by nginx in the deployed PoC
// (poc-runner) and by the Metro dev proxy locally (metro.config.js). iOS/Android have no CORS and
// call the API directly; they pass the site gate with the same password before logging in.

import { Platform } from 'react-native';

import POC_VM from '@/constants/poc-vm.json';

import { clearSession, getSession, saveSession, type SessionUser } from '@/features/auth/session';

export const API_ORIGIN = `https://api.${POC_VM.domain}`;
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
  /** Only for self-employed customers. */
  onderneming?: { naam: string; sector: string; omschrijving: string; werknemers: number };
}

/** Moment as a customer sees it: privacy-filtered by the backend. */
export interface KlantMoment {
  moment: 'GEZINSUITBREIDING' | 'HUIS_KOPEN' | 'TROUWEN' | 'ZAAK_STARTEN' | 'ZAAK_UITBREIDEN';
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

// ---- Ecosystems, partners and clusters (backend src/ecosysteem.ts, routes/ecosystemen.ts) ----

export type EcosysteemId =
  | 'WONEN' | 'MOBILITEIT' | 'PENSIOEN' | 'BELEGGEN' | 'SPAREN' | 'ONDERNEMEN' | 'REIZEN' | 'ENERGIE'
  | 'DAGELIJKS_BANKIEREN' | 'GEZIN' | 'GEZONDHEID' | 'VERMOGEN' | 'WERK' | 'INTERNATIONAAL'
  | 'BESCHERMING_ONDERNEMING' | 'LANDBOUW' | 'ADMINISTRATIE' | 'WINKELEN' | 'DIGITAAL' | 'VEILIGHEID' | 'INTEGRATIES';
export type LinkStatus = 'actief' | 'gekend' | 'mogelijk';
/** Where KBC knows a partner relation from: payments on the account, use inside KBC Mobile, or the customer added it. */
export type Herkomst = 'REKENING' | 'KBC_MOBILE' | 'KLANT';
export type NodeId = `product:${string}` | `partner:${string}`;

export interface Waarom {
  via: NodeId | `moment:${string}`;
  naam: string;
  /** Third person, e.g. "Vliegt via Brussels Airport". */
  reden: string;
}

export interface Link {
  id: NodeId;
  soort: 'product' | 'partner';
  /** Product or partner id in the catalogue. */
  ref: string;
  naam: string;
  ecosysteem: EcosysteemId;
  status: LinkStatus;
  herkomst?: Herkomst | 'KBC_PRODUCT';
  sinds?: string;
  /** `mogelijk` only. */
  score?: number;
  waarom?: Waarom[];
}

export interface Cluster {
  ecosysteem: EcosysteemId;
  naam: string;
  /** The strongest link in the cluster. */
  status: LinkStatus;
  links: Link[];
}

export interface EcosystemenResponse {
  week: number;
  samenvatting: {
    actief: number;
    gekend: number;
    mogelijk: number;
    ecosystemen: number;
    /** Clusters with only `mogelijk` links: where the world can grow. */
    nieuweEcosystemen: EcosysteemId[];
  };
  clusters: Cluster[];
}

/** Every catalogue partner with the customer's relation to it. */
export interface KlantPartner {
  partner: string;
  naam: string;
  ecosysteem: EcosysteemId;
  gevoelig: boolean;
  klantBijPartner: boolean;
  deelt: boolean;
  herkomst: Herkomst | null;
  sinds: string | null;
}

export interface CatalogusProduct {
  id: string;
  naam: string;
  ecosysteem: EcosysteemId;
  partners: string[];
  /** B2B products are never shown to a customer. */
  kanaal: 'KLANT' | 'B2B';
}

export interface CatalogusPartner {
  id: string;
  naam: string;
  ecosysteem: EcosysteemId;
  ecosystemen: EcosysteemId[];
  producten: string[];
  /** Health partners: never drawn, suggested or connected. */
  gevoelig: boolean;
}

export interface CatalogusResponse {
  ecosystemen: { id: EcosysteemId; naam: string; aantalProducten: number; partners: string[] }[];
  producten: CatalogusProduct[];
  partners: CatalogusPartner[];
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

export async function kbcRequest<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<T> {
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

// ---- Calls for the world (K = /v1/klanten/:klantId) ----

const K = () => `/v1/klanten/${currentKlantId()}`;

export const kbcWorld = {
  /** The whole catalogue: same for everyone, so cache it. */
  catalogus: () => kbcRequest<CatalogusResponse>('GET', '/v1/catalogus'),
  profiel: () => kbcRequest<KlantProfiel>('GET', K()),
  ecosystemen: () => kbcRequest<EcosystemenResponse>('GET', `${K()}/ecosystemen`),
  partners: () => kbcRequest<KlantPartner[]>('GET', `${K()}/partners`),
  /** Allow or stop a partner sharing data with KBC. Only the customer may (role klant). */
  setDeling: (partner: string, deelt: boolean) =>
    kbcRequest<KlantPartner | undefined>('PUT', `${K()}/partners/${encodeURIComponent(partner)}`, { deelt }),
  setToestemming: (toestemming: Record<Bron, boolean>) =>
    kbcRequest<Record<Bron, boolean>>('PUT', `${K()}/toestemming`, toestemming),
};
