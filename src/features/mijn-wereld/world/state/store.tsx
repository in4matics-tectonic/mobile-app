// WorldProvider: loads the customer's world, polls it while the screen is focused, writes partner sharing and
// consent, and keeps the seen-set (D9) that decides which places are new. Sits inside MijnWereldProvider,
// because the family moment (phase 1) adds the baby to the household.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { TIMING } from '../../mocks/tomEnLien';
import { KbcApiError, type Bron } from '../../services/kbcApi';
import { worldService, type WorldUpdate } from '../../services/worldService';
import { useMijnWereld } from '../../state/store';
import { buildWorld, type BuiltWorld } from '../buildWorld';
import type { CategoryId } from '../types';
import { initialWorldState, worldReducer, type WorldState } from './reducer';

/** After a 429, poll every 5s for a minute. */
const BACKOFF = { interval: 5000, duration: 60_000 } as const;

interface WorldContextValue {
  state: WorldState;
  built: BuiltWorld | null;
}

export interface WorldCommands {
  reload: () => Promise<void>;
  /** Koppel (true) / Stop delen (false). Resolves false when it failed; the sheet shows the error. */
  setDeling: (partner: string, deelt: boolean) => Promise<boolean>;
  setConsent: (bron: Bron, value: boolean) => Promise<boolean>;
  /** The Street played these places' arrivals: they're no longer new. */
  markArrivalsSeen: (placeIds: CategoryId[]) => void;
  dismissFinding: (id: string) => void;
}

const WorldContext = createContext<WorldContextValue | null>(null);
const CommandsContext = createContext<WorldCommands | null>(null);

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const entry = (link: { id: string; status: string }) => `${link.id}:${link.status}`;
const idOf = (seenEntry: string) => seenEntry.slice(0, seenEntry.lastIndexOf(':'));

/** actief and gekend links drawn in the world. */
const drawnLinks = (built: BuiltWorld) =>
  built.clusters.flatMap((c) => c.links).filter((l) => l.status !== 'mogelijk' && built.linkPlace[l.id]);

export function WorldProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(worldReducer, initialWorldState);
  const { phase } = useMijnWereld();
  const focused = useIsFocused();
  const [active, setActive] = useState(AppState.currentState !== 'background');
  const stateRef = useRef(state);
  const lastUpdate = useRef('');
  const backoffUntil = useRef(0);
  const storageKey = useRef('');

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setActive(s !== 'background'));
    return () => sub.remove();
  }, []);

  // ---- Derived world ----

  const pendingBaby = phase === 'ask';
  const baby = phase === 'confirmed' || phase === 'done';
  const seenIds = useMemo(() => (state.seen ? new Set(state.seen.map(idOf)) : null), [state.seen]);
  const { data } = state;
  const built = useMemo(
    () =>
      data
        ? buildWorld({
            catalogus: data.catalogus,
            ecosystemen: data.ecosystemen,
            naam: data.profiel.naam,
            onderneming: data.profiel.onderneming?.naam,
            family: { pendingBaby, baby },
            seen: seenIds,
          })
        : null,
    [data, pendingBaby, baby, seenIds],
  );

  // ---- Load ----

  const apply = useCallback((update: WorldUpdate) => {
    const json = JSON.stringify(update);
    if (json === lastUpdate.current) return;
    lastUpdate.current = json;
    dispatch({ type: 'WORLD_UPDATED', update });
  }, []);

  const load = useCallback(async () => {
    try {
      storageKey.current = `mijn-wereld:seen:${worldService.klantId()}`;
      const [loaded, stored] = await Promise.all([
        worldService.load(),
        AsyncStorage.getItem(storageKey.current).catch(() => null),
      ]);
      lastUpdate.current = JSON.stringify({ ecosystemen: loaded.ecosystemen, partners: loaded.partners });
      dispatch({ type: 'WORLD_LOADED', data: loaded });
      if (stateRef.current.seen) return;
      let seen: string[] | null = null;
      try {
        seen = stored ? (JSON.parse(stored) as string[]) : null;
      } catch {
        // Unreadable: treat as a first launch.
      }
      if (!seen) {
        // First launch: everything that's there now counts as seen, so nothing celebrates.
        const first = buildWorld({
          catalogus: loaded.catalogus,
          ecosystemen: loaded.ecosystemen,
          naam: loaded.profiel.naam,
          family: { pendingBaby: false, baby: false },
          seen: null,
        });
        seen = drawnLinks(first).map(entry);
      }
      dispatch({ type: 'SEEN_LOADED', seen });
    } catch (e) {
      dispatch({ type: 'LOAD_FAILED', error: message(e) });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    try {
      apply(await worldService.refresh());
    } catch (e) {
      if (e instanceof KbcApiError && e.status === 429) backoffUntil.current = Date.now() + BACKOFF.duration;
    }
  }, [apply]);

  // ---- Poll while the screen is focused and the app is in front ----

  const ready = state.status === 'ready';
  useEffect(() => {
    if (!ready || !focused || !active) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      const wait = Date.now() < backoffUntil.current ? BACKOFF.interval : TIMING.momentPoll;
      timer = setTimeout(tick, wait);
    };
    const tick = async () => {
      await refresh();
      if (!cancelled) next();
    };
    next();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ready, focused, active, refresh]);

  // ---- Seen-set ----

  // Persist every change.
  useEffect(() => {
    if (state.seen && storageKey.current) {
      AsyncStorage.setItem(storageKey.current, JSON.stringify(state.seen)).catch(() => {});
    }
  }, [state.seen]);

  // Everything that's not a new place is seen right away; a link that turned actief is an arrival for Kate.
  // New places wait until the Street has played their arrival (markArrivalsSeen).
  useEffect(() => {
    if (!built || !state.seen) return;
    const seen = new Set(state.seen);
    const waiting = new Set(built.view.places.filter((p) => p.isNew).flatMap((p) => p.links.map((l) => l.id)));
    const entries: string[] = [];
    const arrived: string[] = [];
    for (const link of drawnLinks(built)) {
      if (seen.has(entry(link)) || waiting.has(link.id)) continue;
      entries.push(entry(link));
      if (link.status === 'actief') arrived.push(link.id);
    }
    if (entries.length) dispatch({ type: 'SEEN_ADDED', entries, arrived });
  }, [built, state.seen]);

  // ---- Commands ----

  const builtRef = useRef(built);
  useEffect(() => {
    builtRef.current = built;
  }, [built]);

  const commands = useMemo<WorldCommands>(
    () => ({
      reload: load,

      async setDeling(partner, deelt) {
        dispatch({ type: 'DELING_START', partner });
        try {
          await worldService.setDeling(partner, deelt);
          // Don't wait for the next poll: the transition should start within a second.
          await refresh();
          dispatch({ type: 'DELING_DONE', partner });
          return true;
        } catch {
          dispatch({ type: 'DELING_FAILED', partner });
          return false;
        }
      },

      async setConsent(bron, value) {
        const current = stateRef.current.data?.profiel.toestemming;
        if (!current) return false;
        try {
          const toestemming = await worldService.setToestemming({ ...current, [bron]: value });
          dispatch({ type: 'PROFILE_UPDATED', toestemming });
          await refresh();
          return true;
        } catch {
          return false;
        }
      },

      markArrivalsSeen(placeIds) {
        const places = builtRef.current?.view.places.filter((p) => placeIds.includes(p.id)) ?? [];
        const links = places.flatMap((p) => p.links);
        if (!links.length) return;
        dispatch({
          type: 'SEEN_ADDED',
          entries: links.map(entry),
          arrived: links.filter((l) => l.status === 'actief').map((l) => l.id),
        });
      },

      dismissFinding: (id) => dispatch({ type: 'FINDING_DISMISSED', id }),
    }),
    [load, refresh],
  );

  const value = useMemo(() => ({ state, built }), [state, built]);

  return (
    <WorldContext.Provider value={value}>
      <CommandsContext.Provider value={commands}>{children}</CommandsContext.Provider>
    </WorldContext.Provider>
  );
}

export function useWorld() {
  const value = useContext(WorldContext);
  if (!value) throw new Error('useWorld must be used inside <WorldProvider>');
  return value;
}

export function useWorldCommands() {
  const commands = useContext(CommandsContext);
  if (!commands) throw new Error('useWorldCommands must be used inside <WorldProvider>');
  return commands;
}
