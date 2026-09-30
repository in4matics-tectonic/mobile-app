// In-memory stand-in for what the KBC Momentum backend doesn't serve yet: domain details, the
// birth checklist and STP actions (endpoints proposed in the technical document).
// With EXPO_PUBLIC_SIGNALS_SOURCE=mock it also plays the moment: signals "arrive" one by one on a
// timer (TIMING.signalInterval) from the first world load.

import type {
  ActionResponse,
  ChecklistResponse,
  MomentResponse,
  TodoId,
  TodoStatus,
  WorldResponse,
} from '../state/types';
import {
  CHECKLIST,
  CUSTOMER,
  DOMAINS,
  GEZIN_AFTER_CONFIRM,
  SIGNAL_FEED,
  THRESHOLD,
  TIMING,
} from './tomEnLien';

export class MockHttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

interface ServerState {
  /** When the signal stream started (first world load). */
  startedAt: number | null;
  closed: boolean;
  answer: 'confirm' | 'reject' | null;
  todo: Record<TodoId, TodoStatus>;
}

function initialState(): ServerState {
  return {
    startedAt: null,
    closed: false,
    answer: null,
    todo: Object.fromEntries(CHECKLIST.todo.map((t) => [t.id, 'open'])) as Record<TodoId, TodoStatus>,
  };
}

let db = initialState();

function moment(): MomentResponse {
  const base = { threshold: THRESHOLD, hiddenSignals: 0, confirmed: db.answer === 'confirm' };
  if (db.closed) return { ...base, score: 0, signals: [], shouldAsk: false, closed: true };
  // A signal only counts with the matching 'Op jouw maat' consent, and health data never counts.
  const arrived = db.startedAt === null ? 0 : Math.floor((Date.now() - db.startedAt) / TIMING.signalInterval);
  const counted = SIGNAL_FEED.slice(0, arrived).filter((s) => CUSTOMER.consents.includes(s.consent) && !s.sensitive);
  const score = Math.min(100, counted.reduce((sum, s) => sum + s.weight, 0));
  return {
    ...base,
    score,
    signals: counted.map((s) => ({ id: s.id, label: s.customerLabel, consent: s.consent })),
    shouldAsk: score >= THRESHOLD,
    closed: false,
  };
}

function world(): WorldResponse {
  db.startedAt ??= Date.now();
  const domains = DOMAINS.map((d) =>
    d.id === 'gezin' && db.answer === 'confirm' ? { ...d, detail: GEZIN_AFTER_CONFIRM } : d
  );
  return { customer: CUSTOMER, domains };
}

function checklist(): ChecklistResponse {
  if (db.answer !== 'confirm') throw new MockHttpError(409, 'Moment is not confirmed');
  return {
    ready: CHECKLIST.ready,
    todo: CHECKLIST.todo.map((t) => ({ ...t, status: db.todo[t.id] })),
  };
}

function runAction(todoId: string): ActionResponse {
  if (db.answer !== 'confirm') throw new MockHttpError(409, 'Moment is not confirmed');
  const item = CHECKLIST.todo.find((t) => t.id === todoId);
  if (!item) throw new MockHttpError(404, `Unknown action ${todoId}`);
  db.todo[item.id] = 'done';
  return { status: 'done', steps: item.steps };
}

type Handler = (params: string[], body: any) => unknown;

const routes: [method: string, pattern: RegExp, handler: Handler][] = [
  ['GET', /^\/customers\/([^/]+)\/world$/, () => world()],
  ['GET', /^\/customers\/([^/]+)\/moments\/family$/, () => moment()],
  [
    'POST',
    /^\/customers\/([^/]+)\/moments\/family\/answer$/,
    (_p, body: { answer: 'confirm' | 'reject' }) => {
      db.answer = body.answer;
      // "Klopt niet" wipes the estimate and closes the moment for good.
      if (body.answer === 'reject') db.closed = true;
      return moment();
    },
  ],
  ['GET', /^\/customers\/([^/]+)\/moments\/family\/checklist$/, () => checklist()],
  [
    'POST',
    /^\/customers\/([^/]+)\/actions\/([^/]+)$/,
    ([, todoId]) => runAction(todoId),
  ],
  [
    'POST',
    /^\/mock\/reset$/,
    () => {
      db = initialState();
      return { ok: true };
    },
  ],
];

// The mock models one persona, so it answers for any customer id (the demo id or the
// backend's klantId when signals come from the live API).
export function handleMockRequest(method: string, path: string, body: unknown): unknown {
  for (const [m, pattern, handler] of routes) {
    const match = m === method ? pattern.exec(path) : null;
    if (match) return handler(match.slice(1), body);
  }
  throw new MockHttpError(404, `No mock route for ${method} ${path}`);
}
