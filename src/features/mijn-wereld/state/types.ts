// Contracts shared by the UI, the reducer and the services.
// The mock server returns exactly these shapes, so swapping in the real API does not touch the UI.

export type Phase = 'signals' | 'ask' | 'declined' | 'confirmed' | 'done';
export type Domain = 'wonen' | 'mobiliteit' | 'energie' | 'sparen' | 'gezin';
export type DomainStatus = 'ok' | 'warn' | 'info';

export interface Customer {
  id: string;
  displayName: string;
  age: number;
  products: string[];
  kateCoins: number;
  /** Consents given in 'Op jouw maat'. */
  consents: string[];
}

export interface DomainDetail {
  subtitle: string;
  facts: [label: string, value: string][];
  tip: string;
}

export interface DomainInfo {
  id: Domain;
  title: string;
  /** Short line under the tile title. */
  summary: string;
  chip?: { label: string; tone: DomainStatus };
  /** Green check next to the island badge. */
  verified: boolean;
  /** Tiles shown in the 2×2 grid (energie only lives on the island). */
  tile: boolean;
  detail: DomainDetail;
}

export type SignalSource = 'Transactie' | 'App-gedrag' | 'Kate-gesprek';

export interface Signal {
  id: string;
  /** ISO month, e.g. '2027-03'. */
  date: string;
  /** Backoffice wording. */
  label: string;
  /** Customer wording, used in "Waarom vraag je dit?". */
  customerLabel: string;
  source: SignalSource;
  /** Percentage points. */
  weight: number;
  /** Consent in 'Op jouw maat' that covers this signal. */
  consent: string;
  /** Health data never counts (GDPR art. 9). */
  sensitive?: boolean;
}

export interface ReadyItem {
  title: string;
  description: string;
}

export type TodoId = 't1' | 't2' | 't3' | 't4' | 't5';
export type TodoStatus = 'open' | 'running' | 'done' | 'failed';

export interface TodoItem {
  id: TodoId;
  title: string;
  description: string;
  basedOn: string;
  price: string;
  steps: string[];
  status: TodoStatus;
}

// ---- API responses ----

export interface WorldResponse {
  customer: Customer;
  domains: DomainInfo[];
}

export interface MomentResponse {
  score: number;
  threshold: number;
  /** Signals that were counted, oldest first. */
  signals: Signal[];
  /** True once the customer said "Klopt niet": the moment never comes back. */
  closed: boolean;
}

export interface ChecklistResponse {
  ready: ReadyItem[];
  todo: TodoItem[];
}

export interface ActionResponse {
  status: 'done' | 'failed';
  steps: string[];
  message?: string;
}

// ---- Screen state ----

export interface AuditEntry {
  at: string;
  kind: 'signaal' | 'vraag' | 'antwoord' | 'stp';
  text: string;
  consent?: string;
}

export interface TodoRun {
  /** How many STP steps are ticked. */
  stepsDone: number;
  error?: string;
}

export interface MijnWereldState {
  status: 'loading' | 'ready' | 'error';
  error?: string;
  customer: Customer | null;
  domains: DomainInfo[];
  phase: Phase;
  moment: MomentResponse;
  checklist: { ready: ReadyItem[]; todo: TodoItem[] } | null;
  runs: Partial<Record<TodoId, TodoRun>>;
  coins: number;
  /** Every question, answer and STP action with time and consent, for audit. */
  audit: AuditEntry[];
}

export type Action =
  | { type: 'LOADED'; world: WorldResponse; moment: MomentResponse }
  | { type: 'LOAD_FAILED'; error: string }
  | { type: 'WORLD_UPDATED'; world: WorldResponse }
  | { type: 'SIGNAL_RECEIVED'; moment: MomentResponse }
  | { type: 'ANSWER_CONFIRM' }
  | { type: 'ANSWER_REJECT' }
  | { type: 'CHECKLIST_LOADED'; checklist: ChecklistResponse }
  | { type: 'TODO_START'; id: TodoId }
  | { type: 'TODO_STEP'; id: TodoId }
  | { type: 'TODO_DONE'; id: TodoId }
  | { type: 'TODO_FAILED'; id: TodoId; error: string }
  | { type: 'RESET' };
