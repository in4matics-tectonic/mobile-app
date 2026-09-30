// In-memory stand-in for the KBC backend. It answers the endpoints proposed in the technical
// document with data from tomEnLien.ts and keeps per-session state, like a real server would.
// Signals "arrive" one by one on a timer (TIMING.signalInterval) from the first world load,
// standing in for the real event sources (transactions, app events, Kate conversations).

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
  if (db.closed) return { score: 0, threshold: THRESHOLD, signals: [], closed: true };
  // A signal only counts with the matching 'Op jouw maat' consent, and health data never counts.
  const arrived = db.startedAt === null ? 0 : Math.floor((Date.now() - db.startedAt) / TIMING.signalInterval);
  const counted = SIGNAL_FEED.slice(0, arrived).filter((s) => CUSTOMER.consents.includes(s.consent) && !s.sensitive);
  const score = Math.min(100, counted.reduce((sum, s) => sum + s.weight, 0));
  return { score, threshold: THRESHOLD, signals: counted, closed: false };
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
];

export function handleMockRequest(
  method: string,
  path: string,
  body: unknown
): unknown {
  for (const [m, pattern, handler] of routes) {
    const match = m === method ? pattern.exec(path) : null;
    if (!match) continue;
    const [, customerId] = match;
    if (customerId !== CUSTOMER.id) {
      throw new MockHttpError(404, `Unknown customer ${customerId}`);
    }
    return handler(match.slice(1), body);
  }
  throw new MockHttpError(404, `No mock route for ${method} ${path}`);
}
