// On web the island renders inline and reuses the Fredoka face loaded by expo-font
// (registered per weight, so no fontWeight to avoid faux bold). Inside the native
// DOM webview the island loads Fredoka from Google Fonts instead.

export const IN_NATIVE_WEBVIEW = !!process.env.EXPO_DOM_HOST_OS;

export const labelFont = IN_NATIVE_WEBVIEW
  ? { fontFamily: 'Fredoka, sans-serif', fontWeight: 600 }
  : { fontFamily: 'Fredoka_600SemiBold, Fredoka, sans-serif' };
