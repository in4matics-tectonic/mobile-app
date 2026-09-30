// One reducer for the whole screen. The UI only reads from this state.
//
//   signals ──(score ≥ threshold)──▶ ask ──confirm──▶ confirmed ──(all todos done)──▶ done
//                                      └──reject──▶ declined (estimate wiped, never asked again)

import { DONE_BONUS_COINS } from '../mocks/tomEnLien';
import type { Action, AuditEntry, MijnWereldState, TodoId, TodoItem } from './types';

export function createInitialState(): MijnWereldState {
  return {
    status: 'loading',
    customer: null,
    domains: [],
    phase: 'signals',
    moment: {
      score: 0,
      threshold: 70,
      signals: [],
      hiddenSignals: 0,
      shouldAsk: false,
      confirmed: false,
      closed: false,
    },
    checklist: null,
    runs: {},
    coins: 0,
    audit: [],
  };
}

function log(state: MijnWereldState, entry: Omit<AuditEntry, 'at'>): AuditEntry[] {
  return [{ ...entry, at: new Date().toISOString() }, ...state.audit].slice(0, 50);
}

function updateTodo(
  state: MijnWereldState,
  id: TodoId,
  patch: Partial<TodoItem>
): MijnWereldState['checklist'] {
  if (!state.checklist) return state.checklist;
  return {
    ...state.checklist,
    todo: state.checklist.todo.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  };
}

/** Kate asks her one question (never a proposal) and logs it for audit. */
function askFor(state: MijnWereldState, moment: MijnWereldState['moment']): MijnWereldState {
  return {
    ...state,
    moment,
    phase: 'ask',
    audit: log(state, {
      kind: 'vraag',
      text: 'Kate vraagt: "Klopt het dat er een gezinsuitbreiding op komst is?"',
      consent: state.customer?.consents.join(', '),
    }),
  };
}

export const openCount = (state: MijnWereldState) =>
  state.checklist?.todo.filter((t) => t.status !== 'done').length ?? 0;

export function reducer(state: MijnWereldState, action: Action): MijnWereldState {
  const name = state.customer?.displayName ?? 'De klant';

  switch (action.type) {
    case 'LOADED': {
      const loaded: MijnWereldState = {
        ...state,
        status: 'ready',
        error: undefined,
        customer: action.world.customer,
        domains: action.world.domains,
        coins: action.world.customer.kateCoins,
        moment: action.moment,
      };
      // Pick up where the backend is: already confirmed, or already past the threshold.
      if (action.moment.confirmed) return { ...loaded, phase: 'confirmed' };
      if (action.moment.shouldAsk) return askFor(loaded, action.moment);
      return loaded;
    }

    case 'LOAD_FAILED':
      return { ...state, status: 'error', error: action.error };

    case 'WORLD_UPDATED':
      return { ...state, domains: action.world.domains };

    case 'SIGNAL_RECEIVED': {
      const moment = action.moment;

      // The backend demo clock went back (backoffice "Demo resetten"): start over.
      if (moment.clock !== undefined && state.moment.clock !== undefined && moment.clock < state.moment.clock) {
        const fresh: MijnWereldState = {
          ...createInitialState(),
          status: 'ready',
          customer: state.customer,
          domains: state.domains,
          coins: state.customer?.kateCoins ?? 0,
          moment,
        };
        return moment.shouldAsk ? askFor(fresh, moment) : fresh;
      }

      // After "Klopt niet" the moment stays closed: new signals change nothing.
      if (state.phase === 'declined' || moment.closed) return state;

      const known = new Set(state.moment.signals.map((s) => s.id));
      let audit = state.audit;
      for (const signal of moment.signals.filter((s) => !known.has(s.id))) {
        audit = log({ ...state, audit }, { kind: 'signaal', text: signal.label, consent: signal.consent });
      }
      const next = { ...state, moment, audit };

      // Confirmed elsewhere (Tom and Lien share one customer, or via their own AI).
      if (moment.confirmed && (state.phase === 'signals' || state.phase === 'ask')) {
        return {
          ...next,
          phase: 'confirmed',
          audit: log(next, { kind: 'antwoord', text: 'Gezinsuitbreiding bevestigd op een ander toestel' }),
        };
      }
      // Below the threshold Kate does nothing visible; at the threshold she asks one question.
      if (state.phase === 'signals' && moment.shouldAsk) return askFor(next, moment);
      // The estimate dropped back under the threshold (e.g. withdrawn elsewhere): stop asking.
      if (state.phase === 'ask' && !moment.shouldAsk) return { ...next, phase: 'signals' };
      return next;
    }

    case 'ANSWER_CONFIRM':
      if (state.phase !== 'ask') return state;
      return {
        ...state,
        phase: 'confirmed',
        audit: log(state, { kind: 'antwoord', text: `${name} bevestigen de gezinsuitbreiding` }),
      };

    case 'ANSWER_REJECT':
      if (state.phase !== 'ask') return state;
      return {
        ...state,
        phase: 'declined',
        moment: { ...state.moment, score: 0, signals: [], hiddenSignals: 0, shouldAsk: false, closed: true },
        audit: log(state, { kind: 'antwoord', text: `${name} zeggen "Klopt niet". Inschatting gewist.` }),
      };

    case 'CHECKLIST_LOADED':
      if (state.phase !== 'confirmed') return state;
      return { ...state, checklist: action.checklist };

    case 'TODO_START': {
      const item = state.checklist?.todo.find((t) => t.id === action.id);
      if (state.phase !== 'confirmed' || !item || item.status === 'done' || item.status === 'running') {
        return state;
      }
      return {
        ...state,
        checklist: updateTodo(state, action.id, { status: 'running' }),
        runs: { ...state.runs, [action.id]: { stepsDone: 0 } },
      };
    }

    case 'TODO_STEP': {
      const run = state.runs[action.id];
      if (!run) return state;
      return { ...state, runs: { ...state.runs, [action.id]: { stepsDone: run.stepsDone + 1 } } };
    }

    case 'TODO_DONE': {
      const item = state.checklist?.todo.find((t) => t.id === action.id);
      if (!item || item.status === 'done') return state;
      const next: MijnWereldState = {
        ...state,
        checklist: updateTodo(state, action.id, { status: 'done' }),
        audit: log(state, {
          kind: 'stp',
          text: `Kate voerde uit: ${item.title}`,
          consent: 'bevestiging klant',
        }),
      };
      if (openCount(next) > 0) return next;
      return { ...next, phase: 'done', coins: state.coins + DONE_BONUS_COINS };
    }

    case 'TODO_FAILED': {
      const item = state.checklist?.todo.find((t) => t.id === action.id);
      if (!item) return state;
      return {
        ...state,
        checklist: updateTodo(state, action.id, { status: 'failed' }),
        runs: { ...state.runs, [action.id]: { stepsDone: 0, error: action.error } },
        audit: log(state, { kind: 'stp', text: `Mislukt: ${item.title}. ${action.error}` }),
      };
    }

    case 'RESET':
      return createInitialState();
  }
}
