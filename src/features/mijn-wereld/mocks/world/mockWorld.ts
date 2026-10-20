// Offline stand-in for the world endpoints, on responses recorded from the backend (2026-10-20, commit cc209bb).
// It handles partner sharing and consent the way the backend does, but doesn't re-run the suggestion rules:
// tips stay as recorded. EXPO_PUBLIC_MOCK_TIMELINE=1 also connects De Lijn after 25s, for an offline arrival.

import { getSession } from '@/features/auth/session';

import type {
  Bron,
  CatalogusResponse,
  Cluster,
  EcosystemenResponse,
  KlantPartner,
  KlantProfiel,
  Link,
  LinkStatus,
} from '../../services/kbcApi';
import catalogusJson from './catalogus.json';
import jonasJson from './jonas.json';
import tomJson from './tom.json';

interface Recorded {
  profiel: KlantProfiel;
  ecosystemen: EcosystemenResponse;
  partners: KlantPartner[];
}

const catalogus = catalogusJson as unknown as CatalogusResponse;
const RECORDED: Record<string, Recorded> = {
  tom: tomJson as unknown as Recorded,
  jonas: jonasJson as unknown as Recorded,
};

const LATENCY = 250;
const delay = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(clone(value)), LATENCY));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const RANK: Record<LinkStatus, number> = { actief: 2, gekend: 1, mogelijk: 0 };
const today = () => new Date().toISOString().slice(0, 10);

interface Db {
  base: Recorded;
  profiel: KlantProfiel;
  /** Every partner relation, also those hidden by a consent that is off. */
  relaties: KlantPartner[];
}

let db: Db | null = null;
let timeline = false;

function state(): Db {
  const persona = getSession()?.user.sub === 'jonas' ? 'jonas' : 'tom';
  if (!db || db.profiel.id !== RECORDED[persona].profiel.id) {
    const base = clone(RECORDED[persona]);
    db = { base, profiel: clone(base.profiel), relaties: clone(base.partners) };
  }
  if (!timeline && process.env.EXPO_PUBLIC_MOCK_TIMELINE === '1') {
    timeline = true;
    setTimeout(() => setDeling('de-lijn', true), 25_000);
  }
  return db;
}

/** As the backend's partnersVan(): a relation seen through a source without consent doesn't count. */
function visible(d: Db, r: KlantPartner) {
  if (!r.klantBijPartner || !r.herkomst) return false;
  if (r.herkomst === 'KLANT') return true;
  return d.profiel.toestemming[r.herkomst === 'REKENING' ? 'REKENING' : 'APP'];
}

function partners(d: Db): KlantPartner[] {
  return d.relaties.map((r) =>
    visible(d, r) ? r : { ...r, klantBijPartner: false, deelt: false, herkomst: null, sinds: null },
  );
}

function ecosystemen(d: Db): EcosystemenResponse {
  const relaties = new Map(partners(d).map((r) => [r.partner, r]));
  const placed = new Set<string>();
  const partnerLink = (link: Link): Link | null => {
    const r = relaties.get(link.ref);
    if (r?.klantBijPartner) {
      placed.add(link.ref);
      const { score: _score, waarom: _waarom, ...rest } = link;
      return { ...rest, status: r.deelt ? 'actief' : 'gekend', herkomst: r.herkomst!, sinds: r.sinds ?? undefined };
    }
    // Recorded as a relation, now gone (consent off or sharing stopped on a KLANT relation)
    return link.status === 'mogelijk' ? link : null;
  };

  const clusters: Cluster[] = d.base.ecosystemen.clusters.map((c) => ({
    ...c,
    links: c.links.map((l) => (l.soort === 'partner' ? partnerLink(l) : l)).filter((l): l is Link => !!l),
  }));

  // Relations the customer added that weren't in the recording
  for (const r of relaties.values()) {
    if (!r.klantBijPartner || placed.has(r.partner)) continue;
    let cluster = clusters.find((c) => c.ecosysteem === r.ecosysteem);
    if (!cluster) {
      const naam = catalogus.ecosystemen.find((e) => e.id === r.ecosysteem)?.naam ?? r.ecosysteem;
      cluster = { ecosysteem: r.ecosysteem, naam, status: 'mogelijk', links: [] };
      clusters.push(cluster);
    }
    cluster.links.unshift({
      id: `partner:${r.partner}`,
      soort: 'partner',
      ref: r.partner,
      naam: r.naam,
      ecosysteem: r.ecosysteem,
      status: r.deelt ? 'actief' : 'gekend',
      herkomst: r.herkomst!,
      sinds: r.sinds ?? undefined,
    });
  }

  const live = clusters
    .filter((c) => c.links.length)
    .map((c) => {
      const best = Math.max(...c.links.map((l) => RANK[l.status]));
      const status = (Object.keys(RANK) as LinkStatus[]).find((s) => RANK[s] === best)!;
      return { ...c, status };
    });
  const links = live.flatMap((c) => c.links);
  const count = (s: LinkStatus) => links.filter((l) => l.status === s).length;
  return {
    week: d.base.ecosystemen.week,
    samenvatting: {
      actief: count('actief'),
      gekend: count('gekend'),
      mogelijk: count('mogelijk'),
      ecosystemen: live.length,
      nieuweEcosystemen: live.filter((c) => c.status === 'mogelijk').map((c) => c.ecosysteem),
    },
    clusters: live,
  };
}

function setDeling(partner: string, deelt: boolean) {
  const d = state();
  const info = catalogus.partners.find((p) => p.id === partner);
  if (!info) return Promise.reject(Object.assign(new Error('not_found'), { status: 404 }));
  if (info.gevoelig && deelt) return Promise.reject(Object.assign(new Error('gevoelige_partner'), { status: 422 }));
  const r = d.relaties.find((x) => x.partner === partner)!;
  if (!visible(d, r)) {
    if (deelt) Object.assign(r, { klantBijPartner: true, deelt: true, herkomst: 'KLANT', sinds: today() });
  } else if (!deelt && r.herkomst === 'KLANT') {
    Object.assign(r, { klantBijPartner: false, deelt: false, herkomst: null, sinds: null });
  } else {
    r.deelt = deelt;
  }
  return delay(partners(d).find((p) => p.partner === partner));
}

export const mockWorld = {
  catalogus: () => delay(catalogus),
  profiel: () => delay(state().profiel),
  ecosystemen: () => delay(ecosystemen(state())),
  partners: () => delay(partners(state())),
  setDeling,
  setToestemming: (toestemming: Record<Bron, boolean>) => {
    const d = state();
    Object.assign(d.profiel.toestemming, toestemming);
    return delay(d.profiel.toestemming);
  },
};
