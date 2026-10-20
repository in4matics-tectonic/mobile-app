// Dutch wording the backend doesn't supply (project-info.md 4.9, Q5): product names (the catalogue is English),
// second-person "via" phrases for Kate's teasers, and je/jullie forms. The backend's own `waarom[].reden`
// is third person and fits the cards' "Waarom?" list as is.

import type { Herkomst, Link } from '../services/kbcApi';

/** "je" for a 1-adult household, "jullie" for 2 adults. */
export interface Voice {
  plural: boolean;
  je: string;
  Je: string;
}

export const voice = (plural: boolean): Voice => ({ plural, je: plural ? 'jullie' : 'je', Je: plural ? 'Jullie' : 'Je' });

interface ProductWords {
  /** Noun phrase without article, e.g. "reisverzekering". */
  naam: string;
  /** Article for "Interesse in een …?". Empty for names that take none. */
  lidwoord?: 'een' | 'de' | '';
  /** Teaser question, when "Interesse in …?" reads wrong. */
  vraag?: (v: Voice) => string;
  /** For an activity rather than a product: "om … te …", e.g. "jullie woonbudget te berekenen". */
  doel?: (v: Voice) => string;
}

const PRODUCTS: Record<string, ProductWords> = {
  // Wonen
  'home-loan': { naam: 'woonkrediet' },
  'renovation-loan': { naam: 'renovatielening' },
  'rental-guarantee': { naam: 'huurwaarborg' },
  'home-insurance': { naam: 'woonverzekering' },
  'home-assistance-insurance': { naam: 'woonassistentieverzekering' },
  'outstanding-balance-insurance': { naam: 'schuldsaldoverzekering' },
  'calculate-housing-budget': {
    naam: 'woonbudget berekenen',
    lidwoord: '',
    vraag: (v) => `${v.Je} woonbudget eens berekenen?`,
    doel: (v) => `${v.je} woonbudget te berekenen`,
  },
  'indicative-online-property-valuation': {
    naam: 'online woningschatting',
    vraag: () => 'Een woning online laten schatten?',
    doel: () => 'een woning online te laten schatten',
  },
  // Mobiliteit
  'car-insurance': { naam: 'autoverzekering' },
  'electric-car-insurance': { naam: 'verzekering voor je elektrische auto', lidwoord: 'de' },
  'electric-car-loan': { naam: 'lening voor een elektrische auto' },
  'calculate-monthly-car-costs': {
    naam: 'maandelijkse autokosten berekenen',
    lidwoord: '',
    vraag: (v) => `${v.Je} autokosten per maand eens berekenen?`,
    doel: (v) => `${v.je} autokosten per maand te berekenen`,
  },
  // Gezin, gezondheid
  'family-insurance': { naam: 'familiale verzekering' },
  'life-insurance': { naam: 'levensverzekering' },
  'accident-insurance': { naam: 'ongevallenverzekering' },
  'hospitalisation-insurance': { naam: 'hospitalisatieverzekering' },
  // Bankieren, sparen, beleggen, pensioen
  'kbc-plus-account': { naam: 'KBC Plus-rekening' },
  'savings-accounts': { naam: 'spaarrekening' },
  'invest-spare-change': {
    naam: 'wisselgeld beleggen',
    lidwoord: '',
    vraag: (v) => `${v.Je} wisselgeld automatisch beleggen?`,
    doel: (v) => `${v.je} wisselgeld automatisch te beleggen`,
  },
  'kbc-investment-plan': { naam: 'KBC-beleggingsplan' },
  'pension-savings-fund': { naam: 'pensioenspaarfonds' },
  'supplementary-pension-for-the-self-employed': { naam: 'VAPZ', lidwoord: 'de' },
  'individual-pension-commitment': { naam: 'IPT' },
  'kbc-team-benefit-plan': { naam: 'KBC Team Benefit Plan' },
  // Winkelen
  'digital-loyalty-cards': {
    naam: 'digitale klantenkaarten',
    lidwoord: '',
    vraag: (v) => `${v.Je} klantenkaarten digitaal in KBC Mobile?`,
    doel: (v) => `${v.je} klantenkaarten digitaal in KBC Mobile te bewaren`,
  },
  'kate-coins': {
    naam: 'Kate Coins',
    lidwoord: '',
    vraag: () => 'Kate Coins sparen bij elke aankoop?',
    doel: () => 'Kate Coins te sparen bij elke aankoop',
  },
  // Reizen
  'travel-insurance': { naam: 'reisverzekering' },
  // Energie
  'energy-loan': { naam: 'energielening' },
  'calculate-solar-panels-and-request-a-quote': {
    naam: 'zonnepanelen berekenen',
    lidwoord: '',
    vraag: () => 'Zonnepanelen laten berekenen?',
    doel: () => 'zonnepanelen te laten berekenen',
  },
  'calculate-a-home-battery-and-request-a-quote': {
    naam: 'thuisbatterij berekenen',
    lidwoord: '',
    vraag: () => 'Een thuisbatterij laten berekenen?',
    doel: () => 'een thuisbatterij te laten berekenen',
  },
  'business-co2-insights-and-sector-comparison': {
    naam: 'CO2-inzicht voor je zaak',
    lidwoord: '',
    vraag: () => 'De CO2-uitstoot van je zaak vergelijken?',
    doel: () => 'de CO2-uitstoot van je zaak te vergelijken met je sector',
  },
  // Ondernemen
  'investment-loan': { naam: 'investeringskrediet' },
  'kbc-business-pro-account': { naam: 'KBC Business PRO-rekening' },
  'kbc-mastercard-business-extra': { naam: 'KBC Mastercard Business Extra', lidwoord: 'de' },
  'kbc-business-debit-card': { naam: 'zakelijke debetkaart' },
  'working-capital-forecasts': {
    naam: 'prognose van je werkkapitaal',
    vraag: () => 'Je werkkapitaal vooruit plannen?',
    doel: () => 'je werkkapitaal vooruit te plannen',
  },
  'business-liability-insurance': { naam: 'BA-verzekering voor je zaak' },
  'guaranteed-income-insurance-for-the-self-employed': { naam: 'verzekering gewaarborgd inkomen' },
  'outstanding-balance-insurance-for-entrepreneurs': { naam: 'schuldsaldoverzekering voor ondernemers' },
  'directors-liability-insurance': { naam: 'bestuurdersaansprakelijkheidsverzekering' },
  'business-legal-assistance-insurance': { naam: 'rechtsbijstand voor je zaak' },
  'occupational-accident-insurance': { naam: 'arbeidsongevallenverzekering' },
  'kbc-employee-care': { naam: 'KBC Employee Care', lidwoord: '' },
  'hedge-foreign-exchange-and-interest-rate-risk': {
    naam: 'indekking tegen wissel- en renterisico',
    vraag: () => 'Je wissel- en renterisico indekken?',
    doel: () => 'je wissel- en renterisico in te dekken',
  },
  'online-fraud-insurance': { naam: 'verzekering tegen online fraude' },
  // More tips the backend's rules can make (REGELS), also after a confirmed life moment
  'bicycle-insurance': { naam: 'fietsverzekering' },
  'bicycle-scooter-or-motorcycle-loan': { naam: 'lening voor een fiets, scooter of motor' },
  'energy-consumption-and-saving-tips': {
    naam: 'bespaartips voor je energie',
    lidwoord: '',
    vraag: () => 'Tips om energie te besparen?',
    doel: (v) => `energie te besparen met inzicht in ${v.je} verbruik`,
  },
  'factoring-and-accounts-receivable-management': { naam: 'factoring en debiteurenbeheer', lidwoord: '' },
  'go-and-deal-pro': { naam: 'Go&Deal Pro', lidwoord: '' },
  'human-capital-solutions': { naam: 'HR-oplossingen voor je personeel', lidwoord: '' },
  'inheritance-planning-service': { naam: 'hulp bij successieplanning', lidwoord: '' },
  'joint-account': { naam: 'gezamenlijke rekening' },
  'kbc-innovation-banking': { naam: 'KBC Innovation Banking', lidwoord: '' },
  'manage-business-mobility-costs': {
    naam: 'mobiliteitskosten van je zaak beheren',
    lidwoord: '',
    vraag: () => 'De mobiliteitskosten van je zaak beheren?',
    doel: () => 'de mobiliteitskosten van je zaak te beheren',
  },
  myhome: { naam: 'MyHome', lidwoord: '', vraag: (v) => `${v.Je} woning beheren in MyHome?`, doel: (v) => `${v.je} woning te beheren in MyHome` },
  'payment-terminals': { naam: 'betaalterminal' },
  'responsible-investing': { naam: 'duurzaam beleggen', lidwoord: '', vraag: () => 'Duurzaam beleggen?', doel: () => 'duurzaam te beleggen' },
  'save-for-someone-else': {
    naam: 'sparen voor iemand anders',
    lidwoord: '',
    vraag: () => 'Sparen voor iemand anders, zoals een kind?',
    doel: () => 'te sparen voor iemand anders, zoals een kind',
  },
  'service-vouchers': { naam: 'dienstencheques', lidwoord: '' },
  'split-group-expenses': {
    naam: 'gedeelde kosten verdelen',
    lidwoord: '',
    vraag: () => 'Gedeelde kosten makkelijk verdelen?',
    doel: () => 'gedeelde kosten makkelijk te verdelen',
  },
  'start-it-at-kbc': { naam: 'Start it @KBC', lidwoord: '' },
  'strategic-advice-through-a-relationship-manager': { naam: 'strategisch advies van een relatiebeheerder', lidwoord: '' },
  'tax-and-legal-advice-for-smes': { naam: 'fiscaal en juridisch advies voor kmo’s', lidwoord: '' },
  'thematic-investing': { naam: 'thematisch beleggen', lidwoord: '', vraag: () => 'Thematisch beleggen?', doel: () => 'thematisch te beleggen' },
};

/** Second person, [je, jullie]. Keyed by `waarom[].via`. */
const VIA: Record<string, [string, string]> = {
  'product:home-loan': ['Je hebt een woonkrediet', 'Jullie hebben een woonkrediet'],
  'product:home-insurance': ['Je hebt een woonverzekering', 'Jullie hebben een woonverzekering'],
  'product:rental-guarantee': ['Je huurt', 'Jullie huren'],
  'product:electric-car-loan': ['Je rijdt elektrisch', 'Jullie rijden elektrisch'],
  'product:electric-car-insurance': ['Je rijdt elektrisch', 'Jullie rijden elektrisch'],
  'product:car-insurance': ['Je hebt een auto', 'Jullie hebben een auto'],
  'product:family-insurance': ['Je hebt een familiale', 'Jullie hebben een familiale'],
  'product:kbc-plus-account': ['Je bankiert bij KBC', 'Jullie bankieren bij KBC'],
  'product:savings-accounts': ['Je spaart al bij KBC', 'Jullie sparen al bij KBC'],
  'product:energy-loan': ['Je investeert al in energie', 'Jullie investeren al in energie'],
  'product:investment-loan': ['Je investeert met een krediet', 'Jullie investeren met een krediet'],
  'product:kbc-business-pro-account': ['Je hebt een zakelijke rekening', 'Jullie hebben een zakelijke rekening'],
  'product:business-liability-insurance': ['Je zaak is verzekerd', 'Jullie zaak is verzekerd'],
  'product:occupational-accident-insurance': ['Je hebt personeel', 'Jullie hebben personeel'],
  'product:supplementary-pension-for-the-self-employed': [
    'Je bouwt pensioen op als zelfstandige',
    'Jullie bouwen pensioen op als zelfstandige',
  ],
  'partner:brussels-airport': ['Je vloog via Brussels Airport', 'Jullie vlogen via Brussels Airport'],
  'partner:immoscoop': ['Je zoekt een woning op Immoscoop', 'Jullie zoeken een woning op Immoscoop'],
  'partner:nmbs': ['Je reist met de trein', 'Jullie reizen met de trein'],
  'partner:cambio': ['Je deelt auto’s via Cambio', 'Jullie delen auto’s via Cambio'],
  'partner:vab': ['Je bent lid van VAB', 'Jullie zijn lid van VAB'],
  'partner:joyn': ['Je spaart Joyn-punten', 'Jullie sparen Joyn-punten'],
  'partner:setle': ['Je liet je renovatie schatten via Setle', 'Jullie lieten jullie renovatie schatten via Setle'],
  'partner:firsty': ['Je gebruikt een reis-eSIM', 'Jullie gebruiken een reis-eSIM'],
  'partner:encon': ['Je krijgt duurzaamheidsadvies van Encon', 'Jullie krijgen duurzaamheidsadvies van Encon'],
  'partner:kube': ['Je rapporteert ESG-cijfers via Kube', 'Jullie rapporteren ESG-cijfers via Kube'],
  'partner:sweco': ['Je liet een waterstudie maken door Sweco', 'Jullie lieten een waterstudie maken door Sweco'],
  'partner:billit': ['Je factureert via Billit', 'Jullie factureren via Billit'],
  'partner:bolero': ['Je belegt via Bolero', 'Jullie beleggen via Bolero'],
  'partner:de-lijn': ['Je neemt de bus of tram', 'Jullie nemen de bus of tram'],
  'partner:go-solid': ['Je laat facturen innen via Go Solid', 'Jullie laten facturen innen via Go Solid'],
  'partner:impact-us-today': ['Je vroeg een offerte bij Impact us today', 'Jullie vroegen een offerte bij Impact us today'],
  'partner:movesmart': ['Je rijdt met een leasewagen', 'Jullie rijden met een leasewagen'],
  'partner:nowjobs': ['Je werkt met flexwerkers via NOWJOBS', 'Jullie werken met flexwerkers via NOWJOBS'],
  'partner:paypal': ['Je betaalt met PayPal', 'Jullie betalen met PayPal'],
  'partner:q8': ['Je tankt bij Q8', 'Jullie tanken bij Q8'],
  'partner:soluz-io': ['Je factureert via Soluz.io', 'Jullie factureren via Soluz.io'],
  'partner:velo-antwerpen': ['Je fietst met Velo', 'Jullie fietsen met Velo'],
  'partner:wero': ['Je betaalt met Wero', 'Jullie betalen met Wero'],
  'product:credit-cards': ['Je hebt een kredietkaart', 'Jullie hebben een kredietkaart'],
  'moment:GEZINSUITBREIDING': ['Je gezin wordt groter', 'Jullie gezin wordt groter'],
  'moment:HUIS_KOPEN': ['Je denkt aan een eigen huis', 'Jullie denken aan een eigen huis'],
  'moment:TROUWEN': ['Je gaat trouwen', 'Jullie gaan trouwen'],
  'moment:ZAAK_STARTEN': ['Je start een zaak', 'Jullie starten een zaak'],
  'moment:ZAAK_UITBREIDEN': ['Je zaak groeit', 'Jullie zaak groeit'],
};

/** Dutch name of a product, falling back to the catalogue's English name. */
export function productName(id: string, fallback: string) {
  return PRODUCTS[id]?.naam ?? fallback;
}

/** "een reisverzekering", "je woonbudget berekenen", … */
export function productWithArticle(id: string, fallback: string) {
  const p = PRODUCTS[id];
  if (!p) return fallback;
  const lidwoord = p.lidwoord ?? 'een';
  return lidwoord ? `${lidwoord} ${p.naam}` : p.naam;
}

/** A link's label in lists: Dutch product name or the partner's own name. */
export function linkLabel(link: Pick<Link, 'soort' | 'ref' | 'naam'>) {
  return link.soort === 'product' ? capitalize(productName(link.ref, link.naam)) : link.naam;
}

/** "jullie woonbudget te berekenen", for tips that are an activity rather than a product. */
export function tipGoal(link: Pick<Link, 'soort' | 'ref'>, v: Voice) {
  return link.soort === 'product' ? PRODUCTS[link.ref]?.doel?.(v) : undefined;
}

/** Second-person phrase for a reason, e.g. "Je vloog via Brussels Airport". */
export function viaPhrase(via: string, naam: string, v: Voice) {
  const known = VIA[via];
  if (known) return known[v.plural ? 1 : 0];
  return v.plural ? `Jullie gebruiken ${naam}` : `Je gebruikt ${naam}`;
}

/** Kate's question for a tip, e.g. "Interesse in een reisverzekering?" */
export function tipQuestion(link: Pick<Link, 'soort' | 'ref' | 'naam'>, v: Voice) {
  if (link.soort === 'partner') return `${link.naam} eens proberen?`;
  const p = PRODUCTS[link.ref];
  if (p?.vraag) return p.vraag(v);
  return `Interesse in ${productWithArticle(link.ref, link.naam)}?`;
}

/** Where KBC knows a partner from, for sheets and the connect finding. */
export function herkomstText(herkomst: Herkomst | 'KBC_PRODUCT' | null | undefined, naam: string, v: Voice) {
  switch (herkomst) {
    case 'REKENING':
      return `KBC ziet betalingen aan ${naam} op ${v.je} rekening.`;
    case 'KBC_MOBILE':
      return `${v.Je} ${v.plural ? 'gebruiken' : 'gebruikt'} ${naam} in KBC Mobile.`;
    case 'KLANT':
      return `${v.Je} ${v.plural ? 'koppelden' : 'koppelde'} ${naam} zelf.`;
    default:
      return '';
  }
}

/** Short origin for a linked partner row: "via KBC Mobile", "via je rekening", "door jou gekoppeld". */
export function herkomstShort(herkomst: Herkomst | 'KBC_PRODUCT' | null | undefined, v: Voice) {
  if (herkomst === 'REKENING') return `via ${v.je} rekening`;
  if (herkomst === 'KBC_MOBILE') return 'via KBC Mobile';
  if (herkomst === 'KLANT') return v.plural ? 'door jullie gekoppeld' : 'door jou gekoppeld';
  return '';
}

/** "2025-06-10" → "juni 2025". */
export function sinceText(sinds: string | null | undefined) {
  if (!sinds) return '';
  const [y, m] = sinds.split('-').map(Number);
  const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  return months[m - 1] ? `${months[m - 1]} ${y}` : sinds;
}

export const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
