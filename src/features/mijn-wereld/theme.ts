// Design tokens from the prototype. The phone world has a fixed daylight look;
// only the page around the web phone frame follows light/dark mode.

import { Platform } from 'react-native';

export const world = {
  ink: '#12305a',
  soft: '#6b7f99',
  card: '#ffffff',
  blue: '#0a5fb4',
  blueShadow: '#073f78',
  good: '#1f9d55',
  title: '#0d2b52',
  greeting: '#2b5d92',
  skyTop: '#8fd0ff',
  skyBottom: '#cdeeff',
  ground: '#f4f8fc',
  focus: '#7cc0ff',
  secondaryBg: '#eaf2fb',
  line: '#e3eaf2',
  tip: '#eef6ff',
  kateGlow: '#ffd34d',
} as const;

export const chipTones = {
  ok: { bg: '#e4f6eb', fg: '#157a42' },
  warn: { bg: '#fff0df', fg: '#b65b00' },
  info: { bg: '#e6f0fb', fg: '#0a5fb4' },
} as const;

export const page = {
  light: {
    bg: '#eef3f9',
    fg: '#0f2138',
    muted: '#5a6b82',
    line: '#d5dfeb',
    panel: '#ffffff',
    accent: '#0a5fb4',
    good: '#1f9d55',
    warn: '#d97706',
  },
  dark: {
    bg: '#0c1522',
    fg: '#e8eef7',
    muted: '#98a8bf',
    line: '#223249',
    panel: '#121e30',
    accent: '#6fb2ff',
    good: '#3ccf7e',
    warn: '#f5a623',
  },
} as const;

/** Loaded in the root layout via @expo-google-fonts. Each weight is its own family on native. */
export const font = {
  display500: 'Fredoka_500Medium',
  display600: 'Fredoka_600SemiBold',
  display700: 'Fredoka_700Bold',
  body400: 'Nunito_400Regular',
  body600: 'Nunito_600SemiBold',
  body700: 'Nunito_700Bold',
  body800: 'Nunito_800ExtraBold',
} as const;

export const shadow = {
  card: '0 6px 0 rgba(12,60,120,.08), 0 10px 24px -10px rgba(12,60,120,.25)',
  tile: '0 4px 0 rgba(12,60,120,.07)',
  coins: '0 4px 0 rgba(12,60,120,.15)',
  primary: `0 3px 0 ${world.blueShadow}`,
  glow: `0 0 0 3px ${world.kateGlow}, 0 10px 24px -10px rgba(12,60,120,.25)`,
  sheet: '0 -10px 30px rgba(8,30,60,.2)',
  phone: '0 30px 60px -20px rgba(10,40,90,.45), inset 0 0 0 2px #2a3445',
} as const;

/** Visible keyboard focus ring (web). */
export const focusRing = Platform.select({
  web: { outlineColor: world.focus, outlineStyle: 'solid', outlineWidth: 3, outlineOffset: 2 },
  default: {},
}) as object;

export const PHONE = { width: 390, height: 812, bezel: 12, radius: 52, frameBreakpoint: 430 } as const;
