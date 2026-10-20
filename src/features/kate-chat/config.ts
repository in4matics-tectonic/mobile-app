// Where the Kate chat lives: the PoC chat server (poc-runner/chat) with `?app=kate`.
// Kate answers as KBC; the chat server talks to the backend on our behalf.

import { Platform } from 'react-native';

import POC_VM from '@/constants/poc-vm.json';

/** The deployed chat on the PoC VM, behind the shared site password (asked once; the cookie lasts 30 days). */
const LIVE_URL = `https://chat.${POC_VM.domain}/?app=kate`;

/**
 * The web dev server (localhost) loads the same live chat through the Metro proxy
 * (scripts/dev-api-proxy.js), which passes the site password with KBC_GATE_PASSWORD from .env.local.
 * Loaded directly, the browser drops the password cookie inside the cross-site iframe and the
 * password page keeps coming back.
 */
const DEV_WEB_URL = '/kate-chat/?app=kate';

const BASE_URL = process.env.EXPO_PUBLIC_KATE_CHAT_URL ?? (__DEV__ && Platform.OS === 'web' ? DEV_WEB_URL : LIVE_URL);

/**
 * Opened in a WebView on iOS/Android and in an iframe on web. Override with EXPO_PUBLIC_KATE_CHAT_URL.
 * The app closes the chat with its own ✕, so `close=0` hides the page's ✕ (new conversation), on any base URL.
 */
export const KATE_CHAT_URL = `${BASE_URL}${BASE_URL.includes('?') ? '&' : '?'}close=0`;
