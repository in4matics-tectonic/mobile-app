// Login session for the KBC Momentum backend, persisted in AsyncStorage
// (localStorage on web). Tokens expire after 1 hour; an expired or rejected
// token sends the customer back to the login screen.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'kbc-momentum/session';

export interface SessionUser {
  sub: string;
  role: 'klant' | 'adviseur' | 'ingest';
  klantId?: string;
}

export interface Session {
  token: string;
  user: SessionUser;
  /** Epoch ms. */
  expiresAt: number;
}

let current: Session | null = null;
const listeners = new Set<(session: Session | null) => void>();

function publish(session: Session | null) {
  current = session;
  listeners.forEach((listener) => listener(session));
}

export function getSession() {
  return current;
}

export function subscribe(listener: (session: Session | null) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Reads the stored token; drops it if it has expired. */
export async function restoreSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const stored = raw ? (JSON.parse(raw) as Session) : null;
    if (stored && stored.expiresAt > Date.now()) {
      publish(stored);
      return stored;
    }
    if (stored) await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Unreadable storage: treat as logged out.
  }
  publish(null);
  return null;
}

export async function saveSession(session: Session) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  publish(session);
}

export async function clearSession() {
  await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  publish(null);
}
