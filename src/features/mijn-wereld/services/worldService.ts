// The customer's world from the KBC Momentum backend: catalogue (cached), profile, ecosystem clusters and
// partner relations, plus the two writes the world makes (partner sharing, consent).
// EXPO_PUBLIC_SIGNALS_SOURCE=mock runs it offline on recorded responses (mocks/world).

import { getSession } from '@/features/auth/session';

import { mockWorld } from '../mocks/world/mockWorld';
import {
  kbcWorld,
  type Bron,
  type CatalogusResponse,
  type EcosystemenResponse,
  type Kans,
  type KansStatus,
  type KlantPartner,
  type KlantProfiel,
} from './kbcApi';

const USE_MOCK = process.env.EXPO_PUBLIC_SIGNALS_SOURCE === 'mock';

export interface WorldData {
  catalogus: CatalogusResponse;
  profiel: KlantProfiel;
  ecosystemen: EcosystemenResponse;
  partners: KlantPartner[];
  /** Opportunities the adviser sent to the app. */
  kansen: Kans[];
}

export type WorldUpdate = Pick<WorldData, 'ecosystemen' | 'partners' | 'kansen'>;

const api = USE_MOCK ? mockWorld : kbcWorld;

// The catalogue is the same for every customer: fetch it once per app session.
let catalogus: Promise<CatalogusResponse> | null = null;
const getCatalogus = () => {
  catalogus ??= api.catalogus().catch((e) => {
    catalogus = null;
    throw e;
  });
  return catalogus;
};

export const worldService = {
  /** Whose world this is: the seen-set is kept per customer. */
  klantId: () => (USE_MOCK ? 'mock' : (getSession()?.user.klantId ?? 'unknown')),

  async load(): Promise<WorldData> {
    const [cat, profiel, ecosystemen, partners, kansen] = await Promise.all([
      getCatalogus(),
      api.profiel(),
      api.ecosystemen(),
      api.partners(),
      api.kansen(),
    ]);
    return { catalogus: cat, profiel, ecosystemen, partners, kansen };
  },

  /** What changes while the screen is open: polled, and re-read right after every write. */
  async refresh(): Promise<WorldUpdate> {
    const [ecosystemen, partners, kansen] = await Promise.all([api.ecosystemen(), api.partners(), api.kansen()]);
    return { ecosystemen, partners, kansen };
  },

  profiel: () => api.profiel(),

  /** Koppel / Stop delen. */
  setDeling: (partner: string, deelt: boolean) => api.setDeling(partner, deelt),

  /** The customer's answer to an opportunity. */
  setKans: (id: string, status: Exclude<KansStatus, 'nieuw'>) => api.setKans(id, status),

  /** "Op jouw maat". The backend accepts a partial body; we send the whole set to be explicit. */
  setToestemming: (toestemming: Record<Bron, boolean>) => api.setToestemming(toestemming),
};
