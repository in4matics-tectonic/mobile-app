// Brand colours for drawn signage (D11: names and colours in our own style, no logo files).
// Names come from the backend catalogue; only colours live here.
//
// "logo" = taken from the fill colours of the brand's own logo SVG on its site (2026-10-20).
// "approx." = the site exposed no colours to read; a well-known brand colour, still to check by eye.

import type { BrandColors } from './types';

const WHITE = '#ffffff';
const INK = '#1b2433';

export const BRAND_COLORS: Record<string, BrandColors> = {
  kbc: { primary: '#0d2a50', secondary: '#0097db', text: WHITE }, // logo
  joyn: { primary: '#0010c3', secondary: '#14cda8', text: WHITE }, // logo
  immoscoop: { primary: '#2d333a', secondary: '#dd2c88', text: WHITE }, // logo
  cambio: { primary: '#eb690b', text: WHITE }, // logo
  vab: { primary: '#ffc900', secondary: '#003a5d', text: '#003a5d' }, // logo (yellow badge with navy lettering)
  q8: { primary: '#20419a', secondary: '#ffc61e', text: WHITE }, // logo
  nmbs: { primary: '#0069b4', secondary: '#ffffff', text: WHITE }, // approx.
  'brussels-airport': { primary: '#0b2c5a', secondary: '#7ac143', text: WHITE }, // approx.
  'de-immowinkel': { primary: '#e2001a', text: WHITE }, // approx.
  'blue-bike': { primary: '#0072bc', secondary: '#f39200', text: WHITE }, // approx.
  'de-lijn': { primary: '#ffdd00', secondary: '#1d1d1b', text: INK }, // approx.
  mivb: { primary: '#e2001a', text: WHITE }, // approx.
  'velo-antwerpen': { primary: '#e30613', text: WHITE }, // approx.
  mobit: { primary: '#00a19a', text: WHITE }, // approx.
  'q-park': { primary: '#ffd200', secondary: '#1d1d1b', text: INK }, // approx.
  '4411': { primary: '#00b2a9', text: WHITE }, // approx.
  movesmart: { primary: '#004f9f', text: WHITE }, // approx.
  firsty: { primary: '#6c3bff', text: WHITE }, // approx.
  setle: { primary: '#00a66c', text: WHITE }, // approx.
  'impact-us-today': { primary: '#2b9348', text: WHITE }, // approx.
  encon: { primary: '#7ab929', text: WHITE }, // approx.
  kube: { primary: '#1c1c3c', secondary: '#4cd3a5', text: WHITE }, // approx.
  sweco: { primary: '#000000', text: WHITE }, // approx.
  proximus: { primary: '#5c2d91', text: WHITE }, // approx.
  orange: { primary: '#ff7900', text: '#000000' }, // approx.
  base: { primary: '#00a3a1', text: WHITE }, // approx.
  'de-tijd': { primary: '#fbe9d0', secondary: '#1d1d1b', text: INK }, // approx.
  'vrt-nws': { primary: '#1d1d1b', secondary: '#ffcf00', text: WHITE }, // approx.
  bolero: { primary: '#00264d', secondary: '#00b5e2', text: WHITE }, // approx.
  billit: { primary: '#2f6bff', text: WHITE }, // approx.
  'soluz-io': { primary: '#1f2a44', text: WHITE }, // approx.
  'go-solid': { primary: '#ff5a00', text: WHITE }, // approx.
  bancontact: { primary: '#005498', secondary: '#ffd800', text: WHITE }, // approx.
  nowjobs: { primary: '#ff3d6e', text: WHITE }, // approx.
  paypal: { primary: '#003087', secondary: '#009cde', text: WHITE }, // approx.
  wero: { primary: '#1e1e1e', secondary: '#ffe500', text: '#ffe500' }, // approx.
  apple: { primary: '#000000', text: WHITE }, // approx.
  ipex: { primary: '#00558c', text: WHITE }, // approx.
};

const FALLBACK: BrandColors = { primary: '#0a5fb4', text: WHITE };

export const brandColors = (partnerId: string) => BRAND_COLORS[partnerId] ?? FALLBACK;
