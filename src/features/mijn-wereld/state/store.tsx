// Holds the reducer and exposes commands that talk to the services.

import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react';

import { CUSTOMER, TIMING } from '../mocks/tomEnLien';
import { actionService } from '../services/actionService';
import { momentService } from '../services/momentService';
import { createInitialState, reducer } from './reducer';
import type { MijnWereldState, TodoId } from './types';

interface Commands {
  reload: () => Promise<void>;
  confirm: () => Promise<void>;
  reject: () => Promise<void>;
  runTodo: (id: TodoId) => Promise<void>;
  runAll: () => Promise<void>;
}

const StateContext = createContext<MijnWereldState | null>(null);
const CommandsContext = createContext<Commands | null>(null);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function MijnWereldProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const stateRef = useRef(state);
  // STP actions run one after another, never in parallel.
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const customerId = () => stateRef.current.customer?.id ?? CUSTOMER.id;

  const load = async () => {
    try {
      const [world, moment] = await Promise.all([
        momentService.getWorld(CUSTOMER.id),
        momentService.getFamilyMoment(CUSTOMER.id),
      ]);
      dispatch({ type: 'LOADED', world, moment });
    } catch (e) {
      dispatch({ type: 'LOAD_FAILED', error: message(e) });
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Keep the moment fresh: new signals, a confirmation on Lien's phone, or a backend demo reset.
  const ready = state.status === 'ready';
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        const moment = await momentService.getFamilyMoment(customerId());
        if (cancelled) return;
        const previous = stateRef.current.moment.clock;
        if (moment.clock !== undefined && previous !== undefined && moment.clock < previous) {
          // Demo reset in the backoffice: clear the mocked checklist progress as well.
          queueRef.current = Promise.resolve();
          await momentService.resetMockState();
        }
        dispatch({ type: 'SIGNAL_RECEIVED', moment });
      } catch {
        // Try again on the next tick.
      }
    }, TIMING.momentPoll);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [ready]);

  // Once confirmed (here or on another device), Kate builds the checklist.
  const needsChecklist = state.phase === 'confirmed' && !state.checklist;
  useEffect(() => {
    if (!needsChecklist) return;
    let cancelled = false;
    (async () => {
      // KateCard shows "Ik zet jullie checklist klaar…" until this succeeds.
      while (!cancelled) {
        try {
          const [checklist, world] = await Promise.all([
            momentService.getChecklist(customerId()),
            momentService.getWorld(customerId()),
          ]);
          if (cancelled) return;
          dispatch({ type: 'CHECKLIST_LOADED', checklist });
          dispatch({ type: 'WORLD_UPDATED', world });
          return;
        } catch {
          await delay(TIMING.momentPoll);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [needsChecklist]);

  const confirm = async () => {
    if (stateRef.current.phase !== 'ask') return;
    dispatch({ type: 'ANSWER_CONFIRM' });
    await momentService.answer(customerId(), 'confirm');
  };

  const reject = async () => {
    if (stateRef.current.phase !== 'ask') return;
    dispatch({ type: 'ANSWER_REJECT' });
    await momentService.answer(customerId(), 'reject');
  };

  const execute = async (id: TodoId) => {
    try {
      const result = await actionService.execute(customerId(), id);
      if (result.status === 'failed') {
        dispatch({ type: 'TODO_FAILED', id, error: result.message ?? 'Er liep iets mis.' });
        return;
      }
      // Demo pacing: reveal each STP step. In production the UI follows the real status.
      for (let i = 0; i < result.steps.length; i++) {
        await delay(TIMING.stpStep);
        dispatch({ type: 'TODO_STEP', id });
      }
      await delay(TIMING.stpSettle);
      dispatch({ type: 'TODO_DONE', id });
    } catch (e) {
      dispatch({ type: 'TODO_FAILED', id, error: `Er liep iets mis (${message(e)}). Er is niets gewijzigd.` });
    }
  };

  const runTodo = (id: TodoId) => {
    const item = stateRef.current.checklist?.todo.find((t) => t.id === id);
    if (!item || item.status === 'done' || item.status === 'running') return queueRef.current;
    // Mark as running right away so the button disappears, then wait for our turn in the queue.
    dispatch({ type: 'TODO_START', id });
    queueRef.current = queueRef.current.then(() => execute(id));
    return queueRef.current;
  };

  const runAll = async () => {
    // Skips items that are already done or running.
    const open = stateRef.current.checklist?.todo.filter(
      (t) => t.status === 'open' || t.status === 'failed'
    );
    let last = queueRef.current;
    for (const item of open ?? []) last = runTodo(item.id);
    await last;
  };

  const commands: Commands = { reload: load, confirm, reject, runTodo, runAll };

  return (
    <StateContext.Provider value={state}>
      <CommandsContext.Provider value={commands}>{children}</CommandsContext.Provider>
    </StateContext.Provider>
  );
}

export function useMijnWereld() {
  const state = useContext(StateContext);
  if (!state) throw new Error('useMijnWereld must be used inside <MijnWereldProvider>');
  return state;
}

export function useMijnWereldCommands() {
  const commands = useContext(CommandsContext);
  if (!commands) throw new Error('useMijnWereldCommands must be used inside <MijnWereldProvider>');
  return commands;
}
