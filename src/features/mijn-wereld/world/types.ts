// The only shapes the world UI knows. Backend shapes stop at worldService and buildWorld().
// Everything in WorldView is JSON-serializable: it crosses the DOM-component bridge into the Street.

import type { EcosysteemId, Link } from '../services/kbcApi';

export type CategoryId =
  | 'house' | 'household' | 'energy' | 'coin-tree' | 'bench' | 'car'
  | 'bank' | 'shop' | 'car-share' | 'bike-station' | 'bus-stop' | 'telecom-shop' | 'newsstand'
  | 'estate-agency' | 'post-office' | 'watchtower'
  | 'fuel-station' | 'train-station' | 'metro' | 'parking' | 'stock-exchange' | 'business' | 'farm'
  | 'airport' | 'island';

export type ZoneId = 'home' | 'neighbourhood' | 'town' | 'away';

/** linked: at least one actief link. ghost: only gekend links, or an empty essential. plot: only mogelijk links. */
export type PlaceState = 'linked' | 'ghost' | 'plot';

export interface BrandColors {
  primary: string;
  secondary?: string;
  /** Lettering on the primary colour. */
  text: string;
}

export interface Brand {
  partnerId: string;
  name: string;
  colors: BrandColors;
}

export interface PlacedBrand extends Brand {
  state: 'linked' | 'ghost';
}

export interface Place {
  /** One place per category per world. */
  id: CategoryId;
  zone: ZoneId;
  state: PlaceState;
  /** Plays the arrival once. */
  isNew: boolean;
  /** Dutch label: the place's name in sheets and for screen readers. */
  label: string;
  ecosystems: EcosysteemId[];
  /** Plot sign text, from the backend cluster name ("Energie?"). */
  plotName?: string;
  /** actief + gekend links drawn here (own, attachments and shields). */
  links: Link[];
  /** Partners on this place's own sign(s). */
  brands: PlacedBrand[];
  /** Partners drawn as details on this place. */
  attachments: PlacedBrand[];
  /** Insurance product ids: a KBC shield badge. */
  shields: string[];
  /** mogelijk links that land here, best score first. */
  tips: Link[];
}

export interface Household {
  adults: 1 | 2;
  children: number;
  names: string[];
  /** Kate asks about a family moment: the dashed baby. */
  pendingBaby: boolean;
  /** Everything for the birth is arranged: a swing hangs in the coin tree. */
  swing: boolean;
}

/** Everything the Street needs. */
export interface WorldView {
  household: Household;
  places: Place[];
}

export type FindingCommand =
  | 'ask-kate' | 'view' | 'connect' | 'confirm' | 'reject' | 'why' | 'checklist' | 'dismiss'
  | 'kans-interesse' | 'kans-afwijzen';

export interface Finding {
  id: string;
  kind: 'moment' | 'suggest' | 'connect' | 'arrived' | 'all-good' | 'kans';
  placeId?: CategoryId;
  link?: Link;
  /** kind 'kans': the opportunity the adviser sent. */
  kansId?: string;
  /** Kate bar, at most 70 characters. */
  teaser?: string;
  /** Finding card. */
  text: string;
  /** Reasons shown under "Waarom?" (suggest). */
  reasons?: string[];
  /** Kate's first chat message. */
  opener?: string;
  /** Jumps to the front of the Kate bar once. */
  isNew: boolean;
  actions: { label: string; command: FindingCommand }[];
}
