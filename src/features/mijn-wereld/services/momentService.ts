// World, life-moment score and checklist.
//
// Kate's signals come from the KBC Momentum backend: the customer profile (name, consents) and
// the GEZINSUITBREIDING moment (score, phase, "waarom", confirmation). The backend computes the
// score and phase; the app never re-derives them. Domain details, the birth checklist and STP are
// not in the backend yet and stay on the mock server.
// Set EXPO_PUBLIC_SIGNALS_SOURCE=mock to run fully offline on mock data.

import { THRESHOLD } from '../mocks/tomEnLien';
import type { ChecklistResponse, MomentResponse, WorldResponse } from '../state/types';
import { request } from './http';
import {
  currentKlantId,
  kbcRequest,
  type Bron,
  type KlantMoment,
  type KlantProfiel,
  type MomentenResponse,
} from './kbcApi';

const USE_MOCK_SIGNALS = process.env.EXPO_PUBLIC_SIGNALS_SOURCE === 'mock';
const MOMENT = 'GEZINSUITBREIDING';

/** How each consent source reads in the 'Op jouw maat' chips. */
const CONSENT_LABELS: Record<Bron, string> = {
  REKENING: 'transacties',
  APP: 'app-gebruik',
  DOCCLE: 'Doccle',
  GEOFENCE: 'locatie',
  EIGEN_AI: 'eigen AI',
};

function toMoment(week: number, m: KlantMoment | undefined): MomentResponse {
  // No moment means no counted signals yet (or they were wiped by "Klopt niet").
  if (!m) {
    return {
      score: 0,
      threshold: THRESHOLD,
      signals: [],
      hiddenSignals: 0,
      shouldAsk: false,
      confirmed: false,
      closed: false,
      clock: week,
    };
  }
  return {
    score: Math.round(m.score * 100),
    threshold: THRESHOLD,
    signals: m.waarom.map((label) => ({ id: label, label })),
    hiddenSignals: m.andereSignalen,
    shouldAsk: m.fase === 'vragen' || m.fase === 'voorstel',
    confirmed: m.bevestigd,
    closed: false,
    clock: week,
  };
}

const mock = {
  getWorld: (customerId: string) => request<WorldResponse>('GET', `/customers/${customerId}/world`),
  getFamilyMoment: (customerId: string) =>
    request<MomentResponse>('GET', `/customers/${customerId}/moments/family`),
  answer: (customerId: string, answer: 'confirm' | 'reject') =>
    request<MomentResponse>('POST', `/customers/${customerId}/moments/family/answer`, { answer }),
  getChecklist: (customerId: string) =>
    request<ChecklistResponse>('GET', `/customers/${customerId}/moments/family/checklist`),
  reset: () => request<{ ok: boolean }>('POST', '/mock/reset'),
};

const live = {
  async getWorld(customerId: string): Promise<WorldResponse> {
    const klantId = await currentKlantId();
    const [world, profiel] = await Promise.all([
      mock.getWorld(customerId),
      kbcRequest<KlantProfiel>('GET', `/v1/klanten/${klantId}`),
    ]);
    const consents = (Object.keys(CONSENT_LABELS) as Bron[])
      .filter((bron) => profiel.toestemming[bron])
      .map((bron) => CONSENT_LABELS[bron]);
    return {
      ...world,
      customer: { ...world.customer, id: profiel.id, displayName: profiel.naam, consents },
    };
  },

  async getFamilyMoment(): Promise<MomentResponse> {
    const klantId = await currentKlantId();
    const res = await kbcRequest<MomentenResponse>('GET', `/v1/klanten/${klantId}/momenten`);
    return toMoment(
      res.week,
      res.momenten.find((m) => m.moment === MOMENT)
    );
  },

  async answer(customerId: string, answer: 'confirm' | 'reject'): Promise<MomentResponse> {
    const klantId = await currentKlantId();
    if (answer === 'confirm') {
      await kbcRequest('POST', `/v1/klanten/${klantId}/momenten/${MOMENT}/bevestig`);
    } else {
      // "Niet voor ons": the backend deletes the signals of this moment.
      await kbcRequest('DELETE', `/v1/klanten/${klantId}/momenten/${MOMENT}`);
    }
    return live.getFamilyMoment();
  },
};

export const momentService = {
  getWorld: (customerId: string) =>
    USE_MOCK_SIGNALS ? mock.getWorld(customerId) : live.getWorld(customerId),

  getFamilyMoment: (customerId: string) =>
    USE_MOCK_SIGNALS ? mock.getFamilyMoment(customerId) : live.getFamilyMoment(),

  answer: (customerId: string, answer: 'confirm' | 'reject') =>
    USE_MOCK_SIGNALS ? mock.answer(customerId, answer) : live.answer(customerId, answer),

  /** The checklist still lives on the mock server: tell it the moment is confirmed, then read it. */
  async getChecklist(customerId: string) {
    await mock.answer(customerId, 'confirm');
    return mock.getChecklist(customerId);
  },

  /** Clears mock-side state (checklist progress) after the backend demo was reset. */
  resetMockState: mock.reset,
};
