// (catalogus, ecosystemen, klant, moment, seen) → WorldView. Pure and deterministic: the same responses always
// give the same world, which keeps the layout stable. The state rules are project-info.md 4.4.

import type { CatalogusResponse, Cluster, EcosysteemId, EcosystemenResponse, Link, LinkStatus } from '../services/kbcApi';
import {
  CATEGORIES,
  CATEGORY_ORDER,
  ECOSYSTEM_ANCHOR,
  NO_PLACE_ECOSYSTEMS,
  PARTNER_PLACEMENT,
  SENSITIVE_PARTNERS,
  shieldHost,
} from './categories';
import { brandColors } from './partners';
import type { CategoryId, Household, Place, PlacedBrand, WorldView } from './types';

export interface WorldInput {
  catalogus: CatalogusResponse;
  ecosystemen: EcosystemenResponse;
  /** Customer name from GET K, e.g. "Tom en Lien". */
  naam: string;
  /** The customer's own company (GET K `onderneming.naam`), signed on the business place. */
  onderneming?: string;
  /** Phase-1 family moment: Kate asks (dashed baby), it is confirmed (baby), and everything is arranged (swing). */
  family: { pendingBaby: boolean; baby: boolean; done?: boolean };
  /** Link ids the customer has seen before (any status). null on the very first launch: nothing is new. */
  seen: ReadonlySet<string> | null;
}

export interface BuiltWorld {
  view: WorldView;
  /** Clusters as the customer may see them: no sensitive partners, no B2B, no DIGITAAL/INTEGRATIES. */
  clusters: Cluster[];
  /** Where each link (tips included) landed, for findings and the text section. */
  linkPlace: Record<string, CategoryId>;
}

type Role = 'own' | 'attachment' | 'shield' | 'anchor';
interface Target {
  category: CategoryId;
  role: Role;
  partnerId?: string;
}

const RANK: Record<LinkStatus, number> = { actief: 2, gekend: 1, mogelijk: 0 };
/** Sign colours for the customer's own company. */
const OWN_BUSINESS = { primary: '#0f7c8c', secondary: '#9be7d8', text: '#ffffff' };

const warned = new Set<string>();
function warnUnknown(id: string) {
  if (!__DEV__ || warned.has(id)) return;
  warned.add(id);
  console.warn(`[mijn-wereld] No place for ${id}: add it to world/categories.ts`);
}

export function buildWorld(input: WorldInput): BuiltWorld {
  const { catalogus, ecosystemen } = input;
  const products = new Map(catalogus.producten.map((p) => [p.id, p]));
  const partnerInfo = new Map(catalogus.partners.map((p) => [p.id, p]));
  const sensitive = (partnerId: string) => SENSITIVE_PARTNERS.has(partnerId) || !!partnerInfo.get(partnerId)?.gevoelig;

  /** Health stays out, B2B stays out, and the app's own ecosystems never become places. */
  const visible = (link: Link) => {
    if (NO_PLACE_ECOSYSTEMS.includes(link.ecosysteem)) return false;
    if (link.soort === 'partner') return !sensitive(link.ref);
    const product = products.get(link.ref);
    if (product?.kanaal === 'B2B') return false;
    return !(product?.partners ?? []).some(sensitive);
  };

  const clusters = ecosystemen.clusters
    .filter((c) => !NO_PLACE_ECOSYSTEMS.includes(c.ecosysteem))
    .map((c) => ({ ...c, links: c.links.filter(visible) }))
    .filter((c) => c.links.length > 0);

  const target = (link: Link): Target | null => {
    if (link.soort === 'partner') {
      const placement = PARTNER_PLACEMENT[link.ref];
      if (!placement) return warnUnknown(link.id), null;
      return { category: placement.category, role: placement.as === 'place' ? 'own' : 'attachment', partnerId: link.ref };
    }
    const product = products.get(link.ref);
    // A product with a partner lands on that partner's place.
    const partnerId = product?.partners.find((p) => PARTNER_PLACEMENT[p]);
    if (partnerId) {
      const placement = PARTNER_PLACEMENT[partnerId];
      return { category: placement.category, role: placement.as === 'place' ? 'own' : 'attachment', partnerId };
    }
    const shield = shieldHost(link.ref, product);
    if (shield) return { category: shield, role: 'shield' };
    const anchor = ECOSYSTEM_ANCHOR[link.ecosysteem];
    if (anchor) return { category: anchor, role: 'anchor' };
    warnUnknown(link.id);
    return null;
  };

  const places = new Map<CategoryId, Place>();
  const ensure = (id: CategoryId): Place => {
    let place = places.get(id);
    if (!place) {
      place = {
        id,
        zone: CATEGORIES[id].zone,
        state: 'ghost',
        isNew: false,
        label: CATEGORIES[id].label,
        ecosystems: [],
        links: [],
        brands: [],
        attachments: [],
        shields: [],
        tips: [],
      };
      places.set(id, place);
    }
    return place;
  };
  const addEcosystem = (place: Place, eco: EcosysteemId) => {
    if (!place.ecosystems.includes(eco)) place.ecosystems.push(eco);
  };
  const upsertBrand = (list: PlacedBrand[], partnerId: string, status: LinkStatus) => {
    const state = status === 'actief' ? 'linked' : 'ghost';
    const existing = list.find((b) => b.partnerId === partnerId);
    if (existing) {
      if (state === 'linked') existing.state = 'linked';
      return;
    }
    const name = partnerInfo.get(partnerId)?.naam ?? partnerId;
    list.push({ partnerId, name, colors: brandColors(partnerId), state });
  };

  const linkPlace: Record<string, CategoryId> = {};

  // 1. actief and gekend links make places.
  for (const cluster of clusters) {
    for (const link of cluster.links) {
      if (link.status === 'mogelijk') continue;
      const t = target(link);
      if (!t) continue;
      const place = ensure(t.category);
      place.links.push(link);
      addEcosystem(place, link.ecosysteem);
      linkPlace[link.id] = t.category;
      if (t.role === 'own' && t.partnerId) upsertBrand(place.brands, t.partnerId, link.status);
      if (t.role === 'attachment' && t.partnerId) upsertBrand(place.attachments, t.partnerId, link.status);
      if (t.role === 'shield' && link.status === 'actief') place.shields.push(link.ref);
    }
  }

  // 2. Essentials and the household always have a place.
  for (const id of CATEGORY_ORDER) if (CATEGORIES[id].essential) ensure(id);
  const household = ensure('household');

  // 3. The island mirrors its REIZEN cluster: an empty island reads wrong, so the airport's status carries over.
  const reizen = clusters.find((c) => c.ecosysteem === 'REIZEN');
  const reizenLinks = reizen?.links.filter((l) => l.status !== 'mogelijk' && linkPlace[l.id]) ?? [];
  if (reizenLinks.length) {
    const island = ensure('island');
    for (const link of reizenLinks) if (!island.links.includes(link)) island.links.push(link);
    addEcosystem(island, 'REIZEN');
  }

  // 4. An anchor whose ecosystem has only mogelijk links is a plot: that's where the world can grow.
  for (const cluster of clusters) {
    if (cluster.status !== 'mogelijk') continue;
    const anchor = ECOSYSTEM_ANCHOR[cluster.ecosysteem];
    if (!anchor) continue;
    const existing = places.get(anchor);
    if (existing && existing.state !== 'plot') continue;
    const plot = ensure(anchor);
    plot.state = 'plot';
    plot.plotName = plot.plotName ? `${plot.plotName} · ${cluster.naam}` : cluster.naam;
    addEcosystem(plot, cluster.ecosysteem);
  }

  // 5. Tips sit where they would land, else on their ecosystem's anchor, else on any place of that ecosystem.
  for (const cluster of clusters) {
    for (const link of cluster.links) {
      if (link.status !== 'mogelijk') continue;
      const t = target(link);
      if (!t) continue;
      const anchor = ECOSYSTEM_ANCHOR[link.ecosysteem];
      const dest =
        places.get(t.category) ??
        (anchor ? places.get(anchor) : undefined) ??
        [...places.values()].find((p) => p.ecosystems.includes(link.ecosysteem));
      if (!dest) continue;
      dest.tips.push(link);
      linkPlace[link.id] = dest.id;
    }
  }

  // 6. States, brands, newness.
  const seen = input.seen;
  for (const place of places.values()) {
    place.tips.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    if (place.state === 'plot') continue;
    const best = Math.max(0, ...place.links.map((l) => RANK[l.status]));
    place.state = best === RANK.actief || place.id === 'household' ? 'linked' : 'ghost';
    if (!place.ecosystems.length) {
      const anchored = (Object.keys(ECOSYSTEM_ANCHOR) as EcosysteemId[]).find((e) => ECOSYSTEM_ANCHOR[e] === place.id);
      if (anchored) place.ecosystems.push(anchored);
    }
    // A place is new when none of its links were ever seen: a gekend → actief change is a transition, not an arrival.
    place.isNew =
      !!seen &&
      !CATEGORIES[place.id].essential &&
      place.id !== 'household' &&
      place.links.length > 0 &&
      place.links.every((l) => !seen.has(l.id));
  }
  const bank = places.get('bank');
  if (bank && bank.state !== 'plot') {
    bank.brands.unshift({ partnerId: 'kbc', name: 'KBC', colors: brandColors('kbc'), state: bank.state });
  }

  const business = places.get('business');
  if (business && business.state !== 'plot' && input.onderneming) {
    business.brands.unshift({ partnerId: 'onderneming', name: input.onderneming, colors: OWN_BUSINESS, state: business.state });
  }

  household.state = 'linked';
  const view: WorldView = {
    household: buildHousehold(input.naam, input.family),
    places: CATEGORY_ORDER.filter((id) => places.has(id)).map((id) => places.get(id)!),
  };
  return { view, clusters, linkPlace };
}

/** No household data in the backend yet (Q1): adults come from the name, "Tom en Lien" → 2. */
export function buildHousehold(naam: string, family: WorldInput['family']): Household {
  const names = naam
    .split(/\s+(?:en|&)\s+/i)
    .map((n) => n.trim())
    .filter(Boolean);
  return {
    adults: names.length >= 2 ? 2 : 1,
    children: family.baby ? 1 : 0,
    names: names.length ? names : [naam],
    pendingBaby: family.pendingBaby && !family.baby,
    swing: Boolean(family.done),
  };
}
