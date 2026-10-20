// Bridge to the PoC showcase (poc-runner), web only. When the app runs in the showcase's iframe, the guided tour
// can log it in as a demo customer and hears back who is logged in. Only messages from the parent frame count,
// and they never carry credentials: the tour asks, the app uses its own demo login.
// The pitch tour also presses the app's buttons through useShowcaseCommands (confirm the moment, open and run the
// checklist, answer an opportunity), so the screen does exactly what a tap would.

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { DEMO_PASSWORD, DEMO_USERS } from '@/features/auth/demo';
import { clearSession, type Session } from '@/features/auth/session';
import { login } from '@/features/mijn-wereld/services/kbcApi';

const framed = Platform.OS === 'web' && typeof window !== 'undefined' && window.parent !== window;
/** Customers the showcase may ask for: Tom & Lien, and Jonas for the pitch's second journey. */
const SHOWCASE_USERS = [...DEMO_USERS, 'jonas'];

/** A login (or user switch) in flight: the showcase may ask again before it lands, and logins are rate limited. */
let switching: Promise<unknown> | null = null;

function tell(msg: Record<string, unknown>) {
  window.parent.postMessage({ part: 'app', ...msg }, '*');
}

export function useShowcaseBridge(session: Session | null, restored: boolean) {
  const user = session?.user.sub ?? null;

  useEffect(() => {
    if (framed && restored) tell({ kateStudio: 'ready', user });
  }, [user, restored]);

  useEffect(() => {
    if (!framed || !restored) return;
    const on = async (e: MessageEvent) => {
      if (e.source !== window.parent || typeof e.data?.kateStudio !== 'string') return;
      if (e.data.kateStudio === 'hello') tell({ kateStudio: 'ready', user });
      if (e.data.kateStudio === 'login') {
        // { user } switches to that demo customer; without it, log in as the first one if nobody is
        const wanted = SHOWCASE_USERS.includes(e.data.user) ? (e.data.user as string) : null;
        if (switching || (user && (!wanted || wanted === user))) return;
        switching = (async () => {
          if (user) await clearSession();
          await login(wanted ?? DEMO_USERS[0], DEMO_PASSWORD);
        })()
          .catch((err) => tell({ kateStudio: 'error', error: String((err as { code?: string })?.code ?? err) }))
          .finally(() => {
            switching = null;
          });
      }
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, [user, restored]);
}

export type ShowcaseCommand =
  | { kateStudio: 'moment'; answer: 'confirm' }
  | { kateStudio: 'checklist'; open?: boolean; run?: 'all' }
  | { kateStudio: 'kans'; answer: 'interesse' | 'afgewezen' };

const COMMANDS = new Set(['moment', 'checklist', 'kans']);

/** The pitch tour's button presses, for the screen that owns those buttons. Always calls the latest handler. */
export function useShowcaseCommands(handle: (c: ShowcaseCommand) => void) {
  const ref = useRef(handle);
  useEffect(() => {
    ref.current = handle;
  });
  useEffect(() => {
    if (!framed) return;
    const on = (e: MessageEvent) => {
      if (e.source !== window.parent || !COMMANDS.has(e.data?.kateStudio)) return;
      ref.current(e.data as ShowcaseCommand);
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, []);
}
