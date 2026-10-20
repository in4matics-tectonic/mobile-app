// What Kate wants to tell the customer (4.9) and the text version of the world (4.10), derived from the built
// world. The backend supplies facts and reasons (score, waarom); this file supplies Dutch wording and order.

import type { Cluster, Link, LinkStatus } from '../../services/kbcApi';
import type { Phase } from '../../state/types';
import type { BuiltWorld } from '../buildWorld';
import { TIP_MIN } from '../categories';
import {
  capitalize,
  herkomstText,
  linkLabel,
  productWithArticle,
  tipGoal,
  tipQuestion,
  viaPhrase,
  voice,
  type Voice,
} from '../labels';
import type { CategoryId, Finding } from '../types';
import type { Arrival } from './reducer';

/** D21: at most this many tips rotate in the Kate bar. */
const BAR_SUGGESTIONS = 3;
/** An arrival this recent goes to the top of the cards. */
const FRESH_MS = 2 * 60_000;
const TEASER_MAX = 70;

export const householdVoice = (built: BuiltWorld | null) => voice((built?.view.household.adults ?? 1) === 2);

/** Where a reason's node lives, so reasons from the tip's own ecosystem can lead. */
type EcosystemOf = (nodeId: string) => Link['ecosysteem'] | undefined;

const sortedReasons = (link: Link, ecosystemOf?: EcosystemOf) =>
  [...(link.waarom ?? [])].sort(
    (a, b) => Number(ecosystemOf?.(b.via) === link.ecosysteem) - Number(ecosystemOf?.(a.via) === link.ecosysteem),
  );

function viaSentence(link: Link, v: Voice, ecosystemOf?: EcosystemOf) {
  const phrases = [...new Set(sortedReasons(link, ecosystemOf).map((w) => viaPhrase(w.via, w.naam, v)))].slice(0, 2);
  if (!phrases.length) return '';
  const [first, second] = phrases;
  return second ? `${first} en ${second[0].toLowerCase()}${second.slice(1)}.` : `${first}.`;
}

/** A tip as Kate words it; also used by the sheets' "Vraag Kate". */
export function tipFinding(link: Link, placeId: CategoryId, v: Voice, ecosystemOf?: EcosystemOf): Finding {
  const via = sortedReasons(link, ecosystemOf)[0];
  const question = tipQuestion(link, v);
  const withVia = via ? `${viaPhrase(via.via, via.naam, v)}. ${question}` : question;
  const isPartner = link.soort === 'partner';
  const what = isPartner ? link.naam : productWithArticle(link.ref, link.naam);
  const goal = tipGoal(link, v);
  const reasonText = viaSentence(link, v, ecosystemOf);
  const text = goal
    ? `${reasonText} Daarom kan het slim zijn om ${goal}.`
    : `${reasonText} Daarom denk ik dat ${what} ${isPartner ? `iets voor ${v.je} kan zijn` : `interessant kan zijn voor ${v.je}`}.`;
  const opener = isPartner
    ? `${reasonText} Zal ik tonen wat ${link.naam} voor ${v.je} kan doen?`
    : goal
      ? `Zal ik ${v.je} helpen om ${goal}?`
      : `Zal ik tonen wat ${what} bij KBC voor ${v.je} kan betekenen?`;
  return {
    id: `suggest:${link.id}`,
    kind: 'suggest',
    placeId,
    link,
    teaser: withVia.length <= TEASER_MAX ? withVia : question,
    text: text.trim(),
    reasons: (link.waarom ?? []).map((w) => w.reden),
    opener: opener.trim(),
    isNew: false,
    actions: [
      { label: 'Vraag Kate', command: 'ask-kate' },
      ...(isPartner ? [{ label: 'Koppel', command: 'connect' as const }] : []),
      { label: 'Bekijk', command: 'view' },
      { label: 'Niet nu', command: 'dismiss' },
    ],
  };
}

function connectFinding(link: Link, placeId: CategoryId, v: Voice): Finding {
  const uses = `${v.Je} ${v.plural ? 'gebruiken' : 'gebruikt'} ${link.naam}.`;
  return {
    id: `connect:${link.ref}`,
    kind: 'connect',
    placeId,
    link,
    teaser: `${uses} Koppel het aan ${v.je} wereld?`,
    text: `${herkomstText(link.herkomst, link.naam, v)} Laat ${link.naam} ${v.je} gegevens delen, dan staat het volledig in ${v.je} wereld.`,
    opener: `Zal ik ${link.naam} voor ${v.je} koppelen? ${v.Je} ${v.plural ? 'kunnen' : 'kan'} het altijd weer stoppen.`,
    isNew: false,
    actions: [
      { label: 'Koppelen', command: 'connect' },
      { label: 'Vraag Kate', command: 'ask-kate' },
      { label: 'Niet nu', command: 'dismiss' },
    ],
  };
}

function arrivedFinding(link: Link, placeId: CategoryId, v: Voice): Finding {
  const label = linkLabel(link);
  const partner = link.soort === 'partner';
  return {
    id: `arrived:${link.id}`,
    kind: 'arrived',
    placeId,
    link,
    teaser: `Nieuw in ${v.je} wereld: ${label}.`,
    text: partner
      ? `${link.naam} deelt nu gegevens met KBC en staat in ${v.je} wereld.`
      : `${label} staat nu in ${v.je} wereld.`,
    opener: `${label} ${partner ? 'is gekoppeld' : 'staat nu in je wereld'}. Zal ik tonen wat dat voor ${v.je} betekent?`,
    isNew: false,
    actions: [
      { label: 'Bekijk', command: 'view' },
      { label: 'Vraag Kate', command: 'ask-kate' },
    ],
  };
}

function momentFinding(phase: Phase, v: Voice, checklist: { ready: number; open: number } | null): Finding | null {
  const bij = v.plural ? ' bij jullie' : '';
  if (phase === 'ask') {
    return {
      id: 'moment:GEZINSUITBREIDING',
      kind: 'moment',
      placeId: 'household',
      teaser: `Ik vermoed een gezinsuitbreiding${bij}. Klopt dat?`,
      text: `Ik vermoed dat er een gezinsuitbreiding op komst is${bij}. Klopt dat?`,
      opener: 'Ik zag enkele signalen die op een gezinsuitbreiding wijzen. Zal ik tonen welke?',
      isNew: false,
      actions: [
        { label: 'Bevestigen', command: 'confirm' },
        { label: 'Klopt niet', command: 'reject' },
        { label: 'Waarom?', command: 'why' },
      ],
    };
  }
  if (phase === 'confirmed') {
    const status = !checklist
      ? 'Ik zet de checklist klaar…'
      : checklist.open === 0
        ? 'Alles is in orde.'
        : `${checklist.ready} dingen zijn al in orde, nog ${checklist.open} te regelen.`;
    return {
      id: 'moment:GEZINSUITBREIDING:plan',
      kind: 'moment',
      placeId: 'household',
      teaser: 'Proficiat! Ik zette een checklist klaar voor de geboorte.',
      text: `Proficiat! ${status}`,
      opener: 'Proficiat met de gezinsuitbreiding! Zal ik overlopen wat er nog te regelen is?',
      isNew: false,
      actions: checklist ? [{ label: 'Bekijk checklist', command: 'checklist' }] : [],
    };
  }
  return null;
}

export interface FindingsInput {
  built: BuiltWorld | null;
  phase: Phase;
  checklist: { ready: number; open: number } | null;
  arrived: Arrival[];
  dismissed: string[];
  now?: number;
}

export interface Findings {
  /** Finding cards, in card order. */
  cards: Finding[];
  /** Kate bar rotation, in priority order (only findings with a teaser). */
  bar: Finding[];
}

export function selectFindings({ built, phase, checklist, arrived, dismissed, now = Date.now() }: FindingsInput): Findings {
  if (!built) return { cards: [], bar: [] };
  const v = householdVoice(built);
  const keep = (f: Finding | null): f is Finding => !!f && !dismissed.includes(f.id);
  const links = new Map<string, Link>(built.clusters.flatMap((c) => c.links).map((l) => [l.id, l]));
  const ecosystemOf: EcosystemOf = (id) => links.get(id)?.ecosysteem;

  const moment = [momentFinding(phase, v, checklist)].filter(keep);

  // One tip per place or plot (the highest), from the D21 score.
  const suggest = built.view.places
    .map((p) => ({ place: p, tip: p.tips.find((t) => (t.score ?? 0) >= TIP_MIN) }))
    .filter((x): x is { place: (typeof x)['place']; tip: Link } => !!x.tip)
    .sort((a, b) => (b.tip.score ?? 0) - (a.tip.score ?? 0))
    .map(({ place, tip }) => tipFinding(tip, place.id, v, ecosystemOf))
    .filter(keep);

  const seenConnect = new Set<string>();
  const connect = built.view.places
    .flatMap((p) => p.links.filter((l) => l.soort === 'partner' && l.status === 'gekend'))
    .filter((l) => !seenConnect.has(l.id) && seenConnect.add(l.id))
    .map((l) => connectFinding(l, built.linkPlace[l.id], v))
    .filter(keep);

  const arrivals = [...arrived]
    .sort((a, b) => b.at - a.at)
    .map((a) => ({ a, link: links.get(a.linkId) }))
    .filter((x): x is { a: Arrival; link: Link } => x.link?.status === 'actief' && !!built.linkPlace[x.link.id])
    .map(({ a, link }) => ({ at: a.at, finding: arrivedFinding(link, built.linkPlace[link.id], v) }))
    .filter((x) => keep(x.finding));

  const fresh = arrivals.filter((x) => now - x.at < FRESH_MS).map((x) => x.finding);
  const older = arrivals.filter((x) => now - x.at >= FRESH_MS).map((x) => x.finding);
  const cards = [...fresh, ...moment, ...suggest, ...connect, ...older];
  const bar = [...moment, ...suggest.slice(0, BAR_SUGGESTIONS), ...connect, ...arrivals.map((x) => x.finding)];

  if (!cards.length) {
    cards.push({
      id: 'all-good',
      kind: 'all-good',
      text: `Alles staat goed in ${v.je} wereld.`,
      isNew: false,
      actions: [],
    });
  }
  return { cards, bar };
}

// ---- Text section ----

export interface TextRow {
  linkId: string;
  label: string;
  /** Partner name, or "KBC" for a product. */
  who: string;
  status: LinkStatus;
  placeId?: CategoryId;
}

export interface TextGroup {
  ecosysteem: Cluster['ecosysteem'];
  naam: string;
  rows: TextRow[];
}

const STATUS_ORDER: Record<LinkStatus, number> = { actief: 0, gekend: 1, mogelijk: 2 };

/** One group per cluster, in the backend's order (strongest first); tips only from the D21 score. */
export function selectTextGroups(built: BuiltWorld | null): TextGroup[] {
  if (!built) return [];
  return built.clusters
    .map((c) => ({
      ecosysteem: c.ecosysteem,
      naam: c.naam,
      rows: c.links
        .filter((l) => l.status !== 'mogelijk' || (l.score ?? 0) >= TIP_MIN)
        .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || (b.score ?? 0) - (a.score ?? 0))
        .map((l) => ({
          linkId: l.id,
          label: l.soort === 'partner' ? l.naam : capitalize(linkLabel(l)),
          who: l.soort === 'partner' ? 'Partner' : 'KBC',
          status: l.status,
          placeId: built.linkPlace[l.id],
        })),
    }))
    .filter((g) => g.rows.length);
}
