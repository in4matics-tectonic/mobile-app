// World state: what the backend returned, what the customer has seen, and what's in flight.

import type { Bron } from '../../services/kbcApi';
import type { WorldData, WorldUpdate } from '../../services/worldService';

export type DelingStatus = 'connecting' | 'failed';

export interface Arrival {
  linkId: string;
  /** Epoch ms: newest arrivals come first. */
  at: number;
}

export interface WorldState {
  status: 'loading' | 'ready' | 'error';
  error?: string;
  data: WorldData | null;
  /** `linkId:status` entries for actief/gekend links the customer has seen. null until read from storage. */
  seen: string[] | null;
  /** Links that became actief this session, for Kate's "arrived" findings. */
  arrived: Arrival[];
  /** Koppel / Stop delen in flight or failed, per partner. */
  deling: Record<string, DelingStatus>;
  /** Findings dismissed with "Niet nu" or ✕ (this session only). */
  dismissed: string[];
}

export type WorldAction =
  | { type: 'WORLD_LOADED'; data: WorldData }
  | { type: 'WORLD_UPDATED'; update: WorldUpdate }
  | { type: 'PROFILE_UPDATED'; toestemming: Record<Bron, boolean> }
  | { type: 'LOAD_FAILED'; error: string }
  | { type: 'SEEN_LOADED'; seen: string[] }
  | { type: 'SEEN_ADDED'; entries: string[]; arrived: string[] }
  | { type: 'DELING_START'; partner: string }
  | { type: 'DELING_DONE'; partner: string }
  | { type: 'DELING_FAILED'; partner: string }
  | { type: 'FINDING_DISMISSED'; id: string };

export const initialWorldState: WorldState = {
  status: 'loading',
  data: null,
  seen: null,
  arrived: [],
  deling: {},
  dismissed: [],
};

const without = <T extends object>(record: T, key: string): T => {
  const next = { ...record };
  delete next[key as keyof T];
  return next;
};

export function worldReducer(state: WorldState, action: WorldAction): WorldState {
  switch (action.type) {
    case 'WORLD_LOADED':
      return { ...state, status: 'ready', error: undefined, data: action.data };

    case 'WORLD_UPDATED':
      if (!state.data) return state;
      return { ...state, data: { ...state.data, ...action.update } };

    case 'PROFILE_UPDATED':
      if (!state.data) return state;
      return { ...state, data: { ...state.data, profiel: { ...state.data.profiel, toestemming: action.toestemming } } };

    case 'LOAD_FAILED':
      return state.data ? state : { ...state, status: 'error', error: action.error };

    case 'SEEN_LOADED':
      return { ...state, seen: action.seen };

    case 'SEEN_ADDED': {
      if (!state.seen) return state;
      const seen = [...new Set([...state.seen, ...action.entries])];
      const now = Date.now();
      const known = new Set(state.arrived.map((a) => a.linkId));
      const arrived = [
        ...action.arrived.filter((id) => !known.has(id)).map((linkId, i) => ({ linkId, at: now + i })),
        ...state.arrived,
      ];
      return { ...state, seen, arrived };
    }

    case 'DELING_START':
      return { ...state, deling: { ...state.deling, [action.partner]: 'connecting' } };
    case 'DELING_DONE':
      return { ...state, deling: without(state.deling, action.partner) };
    case 'DELING_FAILED':
      return { ...state, deling: { ...state.deling, [action.partner]: 'failed' } };

    case 'FINDING_DISMISSED':
      return state.dismissed.includes(action.id) ? state : { ...state, dismissed: [...state.dismissed, action.id] };
  }
}
