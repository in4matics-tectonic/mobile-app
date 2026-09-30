import { useEffect, useState, useSyncExternalStore } from 'react';

import { getSession, restoreSession, subscribe } from './session';
import { useShowcaseBridge } from './useShowcaseBridge';

/** 'loading' until the stored token has been read from AsyncStorage. */
export function useAuth() {
  const [restored, setRestored] = useState(false);
  const session = useSyncExternalStore(subscribe, getSession, () => null);

  useEffect(() => {
    restoreSession().finally(() => setRestored(true));
  }, []);

  useShowcaseBridge(session, restored);

  return {
    status: !restored ? ('loading' as const) : session ? ('signedIn' as const) : ('signedOut' as const),
    session,
  };
}
