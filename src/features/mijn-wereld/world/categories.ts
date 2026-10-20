// THE mapping between the backend and the drawing (project-info.md 4.4). Backend partners, ecosystems and
// products map onto drawn categories here, and nowhere else. An id this file doesn't know draws nothing.

import type { CatalogusProduct, EcosysteemId } from '../services/kbcApi';
import type { CategoryId, ZoneId } from './types';

export interface CategoryMeta {
  label: string;
  zone: ZoneId;
  /** World units on the main row. */
  width: number;
  /** Always has a place: a ghost until linked. */
  essential?: boolean;
}

/** Categories in street order: within a zone, places follow this order. */
export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  house: { label: 'Thuis', zone: 'home', width: 170, essential: true },
  household: { label: 'Gezin', zone: 'home', width: 90 },
  energy: { label: 'Energie', zone: 'home', width: 80 },
  'coin-tree': { label: 'Sparen', zone: 'home', width: 90 },
  bench: { label: 'Pensioen', zone: 'home', width: 80 },
  car: { label: 'Auto', zone: 'home', width: 110 },
  bank: { label: 'Bank', zone: 'neighbourhood', width: 140 },
  shop: { label: 'Winkel', zone: 'neighbourhood', width: 150, essential: true },
  'car-share': { label: 'Autodelen', zone: 'neighbourhood', width: 90 },
  'bike-station': { label: 'Deelfietsen', zone: 'neighbourhood', width: 100 },
  'bus-stop': { label: 'Bushalte', zone: 'neighbourhood', width: 90 },
  'telecom-shop': { label: 'Telecomwinkel', zone: 'neighbourhood', width: 110 },
  newsstand: { label: 'Krantenkiosk', zone: 'neighbourhood', width: 70 },
  'estate-agency': { label: 'Immokantoor', zone: 'neighbourhood', width: 110 },
  'post-office': { label: 'Postkantoor', zone: 'neighbourhood', width: 110 },
  watchtower: { label: 'Veiligheid', zone: 'neighbourhood', width: 70 },
  'fuel-station': { label: 'Tankstation', zone: 'town', width: 150 },
  'train-station': { label: 'Station', zone: 'town', width: 190 },
  metro: { label: 'Metro', zone: 'town', width: 80 },
  parking: { label: 'Parking', zone: 'town', width: 120 },
  'stock-exchange': { label: 'Beleggen', zone: 'town', width: 140 },
  business: { label: 'Mijn zaak', zone: 'town', width: 170 },
  farm: { label: 'Boerderij', zone: 'town', width: 180 },
  airport: { label: 'Luchthaven', zone: 'away', width: 200 },
  island: { label: 'Reizen', zone: 'away', width: 260 },
};

/** D21: Kate only mentions tips from this score (the backend shows them from 0.25). */
export const TIP_MIN = 0.35;

export const CATEGORY_ORDER = Object.keys(CATEGORIES) as CategoryId[];
export const ZONE_ORDER: ZoneId[] = ['home', 'neighbourhood', 'town', 'away'];
export const ZONE_LABELS: Record<ZoneId, string> = { home: 'Thuis', neighbourhood: 'Buurt', town: 'Stad', away: 'Reis' };

/** Where an ecosystem's KBC products land. */
export const ECOSYSTEM_ANCHOR: Partial<Record<EcosysteemId, CategoryId>> = {
  WONEN: 'house',
  GEZIN: 'household',
  GEZONDHEID: 'household',
  ENERGIE: 'energy',
  SPAREN: 'coin-tree',
  VERMOGEN: 'coin-tree',
  PENSIOEN: 'bench',
  MOBILITEIT: 'car',
  DAGELIJKS_BANKIEREN: 'bank',
  WINKELEN: 'shop',
  ADMINISTRATIE: 'post-office',
  VEILIGHEID: 'watchtower',
  BELEGGEN: 'stock-exchange',
  ONDERNEMEN: 'business',
  BESCHERMING_ONDERNEMING: 'business',
  WERK: 'business',
  INTERNATIONAAL: 'business',
  LANDBOUW: 'farm',
  REIZEN: 'island',
};

/** The app and the Kate bar are these ecosystems: they never become places. */
export const NO_PLACE_ECOSYSTEMS: EcosysteemId[] = ['DIGITAAL', 'INTEGRATIES'];

export interface Placement {
  category: CategoryId;
  /** Its own building (or a sign on a shared one), or a detail drawn on another place. */
  as: 'place' | 'attachment';
}

const place = (category: CategoryId): Placement => ({ category, as: 'place' });
const attach = (category: CategoryId): Placement => ({ category, as: 'attachment' });

/** Every non-sensitive partner in the backend catalogue. */
export const PARTNER_PLACEMENT: Record<string, Placement> = {
  q8: place('fuel-station'),
  nmbs: place('train-station'),
  'de-lijn': place('bus-stop'),
  mivb: place('metro'),
  cambio: place('car-share'),
  'blue-bike': place('bike-station'),
  'velo-antwerpen': place('bike-station'),
  mobit: place('bike-station'),
  'q-park': place('parking'),
  '4411': place('parking'),
  vab: attach('car'),
  movesmart: attach('car'),
  'brussels-airport': place('airport'),
  firsty: attach('island'),
  setle: attach('house'),
  'impact-us-today': attach('house'),
  'de-immowinkel': attach('house'),
  immoscoop: place('estate-agency'),
  encon: attach('energy'),
  kube: attach('energy'),
  sweco: attach('energy'),
  joyn: place('shop'),
  proximus: place('telecom-shop'),
  orange: place('telecom-shop'),
  base: place('telecom-shop'),
  'de-tijd': place('newsstand'),
  'vrt-nws': place('newsstand'),
  bolero: place('stock-exchange'),
  billit: attach('business'),
  'soluz-io': attach('business'),
  'go-solid': attach('business'),
  bancontact: attach('business'),
  nowjobs: attach('business'),
  paypal: attach('bank'),
  wero: attach('bank'),
  apple: attach('bank'),
  ipex: place('post-office'),
};

/**
 * Health partners: never a place, attachment, finding or label, even if the backend returns them.
 * The catalogue's `gevoelig` flag is checked too; this list is the safety net.
 */
export const SENSITIVE_PARTNERS = new Set(['helena', 'leadlife', 'kom-op-tegen-kanker']);

/** Insurance products become a KBC shield on the place they protect. An insurance alone links its place. */
const SHIELDS: Record<string, CategoryId> = {
  'home-insurance': 'house',
  'home-assistance-insurance': 'house',
  'outstanding-balance-insurance': 'house',
  'car-insurance': 'car',
  'electric-car-insurance': 'car',
  'bicycle-insurance': 'car',
  'moped-insurance': 'car',
  'motorcycle-insurance': 'car',
  'family-insurance': 'household',
  'life-insurance': 'household',
  'accident-insurance': 'household',
  'funeral-insurance': 'household',
  'hospitalisation-insurance': 'household',
  'kbc-hospital-care': 'household',
  'travel-insurance': 'island',
  'online-fraud-insurance': 'watchtower',
};

export function shieldHost(productId: string, product: CatalogusProduct | undefined): CategoryId | undefined {
  if (SHIELDS[productId]) return SHIELDS[productId];
  if (product?.ecosysteem === 'BESCHERMING_ONDERNEMING') return 'business';
  return undefined;
}
