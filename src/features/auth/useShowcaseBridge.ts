// Bridge to the PoC showcase (poc-runner), web only. When the app runs in the showcase's iframe, the guided tour
// can log it in as the demo customer and hears back who is logged in. Only messages from the parent frame count,
// and they never carry credentials: the tour asks, the app uses its own demo login.

import { useEffect } from 'react';
import { Platform } from 'react-native';

import { DEMO_PASSWORD, DEMO_USERS } from '@/features/auth/demo';
import type { Session } from '@/features/auth/session';
import { login } from '@/features/mijn-wereld/services/kbcApi';

const framed = Platform.OS === 'web' && typeof window !== 'undefined' && window.parent !== window;

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
    const on = (e: MessageEvent) => {
      if (e.source !== window.parent || typeof e.data?.kateStudio !== 'string') return;
      if (e.data.kateStudio === 'hello') tell({ kateStudio: 'ready', user });
      if (e.data.kateStudio === 'login' && !user) {
        login(DEMO_USERS[0], DEMO_PASSWORD).catch((err) => tell({ kateStudio: 'error', error: String(err?.code ?? err) }));
      }
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, [user, restored]);
}
