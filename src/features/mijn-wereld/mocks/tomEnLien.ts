// All demo data for the persona Tom & Lien (32). Fictional people and amounts.
// Change a value here and the UI follows: nothing below is duplicated in components.

import type { ChecklistResponse, Customer, DomainInfo, Signal } from '../state/types';

export const CUSTOMER: Customer = {
  id: 'BE-20931',
  displayName: 'Tom & Lien',
  age: 32,
  products: ['Woonkrediet', 'Woonverzekering', 'Autoverzekering omnium', 'Spaarrekening'],
  kateCoins: 860,
  consents: ['transacties', 'app-gebruik'],
};

export const THRESHOLD = 70;

/** Bonus when every checklist item is arranged. */
export const DONE_BONUS_COINS = 100;

export const DOMAINS: DomainInfo[] = [
  {
    id: 'wonen',
    title: 'Wonen',
    summary: 'Woonkrediet · nog 23 jaar',
    chip: { label: 'in orde', tone: 'ok' },
    verified: true,
    tile: true,
    detail: {
      subtitle: 'Rijwoning, Mechelen · gekocht in 2024',
      facts: [
        ['Woonkrediet', '€ 248.000 open'],
        ['Maandlast', '€ 1.186'],
        ['Woonverzekering', 'actief'],
        ['Schuldsaldo', '50/50 · 2 personen'],
      ],
      tip: 'Alles in orde. Ik kijk mee als jullie situatie verandert.',
    },
  },
  {
    id: 'mobiliteit',
    title: 'Mobiliteit',
    summary: 'Omnium · Tom & Lien',
    chip: { label: 'in orde', tone: 'ok' },
    verified: true,
    tile: true,
    detail: {
      subtitle: 'Compacte wagen · 2019',
      facts: [
        ['Autoverzekering', 'omnium'],
        ['Bestuurders', 'Tom, Lien'],
        ['Schadevrije jaren', '8'],
      ],
      tip: 'Jullie zijn goed verzekerd voor jullie huidige wagen.',
    },
  },
  {
    id: 'gezin',
    title: 'Gezin',
    summary: 'Tom & Lien',
    chip: { label: '2', tone: 'info' },
    verified: false,
    tile: true,
    detail: {
      subtitle: 'Tom & Lien, 32',
      facts: [
        ['Leden', '2'],
        ['Gedeelde rekening', 'ja'],
      ],
      tip: 'Ik houd jullie gezinssituatie bij, alleen met jullie toestemming.',
    },
  },
  {
    id: 'sparen',
    title: 'Sparen',
    summary: 'Spaarrekening · buffer',
    chip: { label: '€ 12.400', tone: 'info' },
    verified: false,
    tile: true,
    detail: {
      subtitle: 'Spaarrekening',
      facts: [
        ['Saldo', '€ 12.400'],
        ['Automatisch sparen', '€ 200/mnd'],
        ['Kate Coins', '860'],
      ],
      tip: 'Jullie buffer dekt ruim drie maanden vaste kosten.',
    },
  },
  {
    id: 'energie',
    title: 'Energie',
    summary: 'Zonnepanelen 4,2 kWp',
    verified: false,
    tile: false,
    detail: {
      subtitle: 'Zonnepanelen 4,2 kWp',
      facts: [
        ['Opbrengst dit jaar', '3.610 kWh'],
        ['Contract', 'vast · tot 2028'],
      ],
      tip: 'Ik vergelijk elke maand automatisch voor jullie.',
    },
  },
];

/** What the world API returns for Gezin once the customer confirmed the moment. */
export const GEZIN_AFTER_CONFIRM: DomainInfo['detail'] = {
  subtitle: 'Tom, Lien & kleine spruit',
  facts: [
    ['Leden', '2 + 1 op komst'],
    ['Groeipakket', 'aanvraag klaargezet'],
  ],
  tip: 'Ik zet de aanvraag voor het Groeipakket klaar zodra de geboorte is aangegeven.',
};

/** The life story: signals as they arrive, oldest first. */
export const SIGNAL_FEED: Signal[] = [
  {
    id: 's1',
    date: '2027-03',
    label: "Spaarrekening hernoemd naar 'Kleine spruit'",
    customerLabel: 'Jullie gaven een spaarrekening een nieuwe naam',
    source: 'App-gedrag',
    weight: 18,
    consent: 'app-gebruik',
  },
  {
    id: 's2',
    date: '2027-04',
    label: 'Aankoop bij babyspeciaalzaak · € 389',
    customerLabel: 'Een aankoop bij een babywinkel',
    source: 'Transactie',
    weight: 20,
    consent: 'transacties',
  },
  {
    id: 's3',
    date: '2027-04',
    label: 'Simulatie gezinswagen in KBC Mobile',
    customerLabel: 'Een simulatie voor een grotere auto',
    source: 'App-gedrag',
    weight: 14,
    consent: 'app-gebruik',
  },
  {
    id: 's4',
    date: '2027-05',
    label: 'Vraag aan Kate over het Groeipakket',
    customerLabel: 'Een vraag aan mij over het Groeipakket',
    source: 'Kate-gesprek',
    weight: 12,
    consent: 'app-gebruik',
  },
  {
    id: 's5',
    date: '2027-05',
    label: 'Betaling inschrijving kinderopvang',
    customerLabel: 'Een betaling aan een kinderopvang',
    source: 'Transactie',
    weight: 16,
    consent: 'transacties',
  },
];

export const CHECKLIST: ChecklistResponse = {
  ready: [
    {
      title: 'Woonverzekering',
      description: 'Jullie huis en inboedel zijn goed verzekerd, ook de nieuwe babyspullen.',
    },
    {
      title: 'Autoverzekering omnium',
      description: 'Jullie kind is als passagier automatisch meeverzekerd.',
    },
    {
      title: 'Spaarbuffer € 12.400',
      description: 'Dekt ruim drie maanden vaste kosten, ook tijdens ouderschapsverlof.',
    },
  ],
  todo: [
    {
      id: 't1',
      title: 'Schuldsaldoverzekering bijwerken',
      description: 'Het woonkrediet blijft betaald als een van jullie wegvalt.',
      basedOn: 'Woonkrediet',
      price: '+ € 9/mnd',
      steps: ['Dekking herberekend voor gezin', 'Polis aangepast'],
      status: 'open',
    },
    {
      id: 't2',
      title: 'Familiale verzekering afsluiten',
      description: 'Jullie kind is verzekerd voor schade aan anderen.',
      basedOn: 'Woonverzekering',
      price: '+ € 7/mnd',
      steps: ['Gebundeld met woonverzekering', 'Polis actief vanaf geboorte'],
      status: 'open',
    },
    {
      id: 't3',
      title: 'Baby meeverzekeren in hospitalisatie',
      description: 'Vanaf de geboorte, zonder wachttijd.',
      basedOn: 'Gezinssamenstelling',
      price: '+ € 8/mnd',
      steps: ['Aanvraag klaargezet', 'Start bij aangifte geboorte'],
      status: 'open',
    },
    {
      id: 't4',
      title: 'Groeipakket aanvragen',
      description: 'Het kindergeld van de overheid, rechtstreeks op jullie rekening.',
      basedOn: 'Beyond Banking',
      price: 'gratis',
      steps: ['Formulier ingevuld', 'Klaar om te versturen na geboorte'],
      status: 'open',
    },
    {
      id: 't5',
      title: "Spaarplan 'Kleine spruit' openen",
      description: '€ 50 per maand. 2% terug in Kate Coins bij babyaankopen.',
      basedOn: 'Spaarrekening',
      price: '€ 50/mnd',
      steps: ['Spaarplan geopend', 'Doorlopende opdracht ingesteld'],
      status: 'open',
    },
  ],
};

/** Demo timings (ms). In production the UI follows the real action status. */
export const TIMING = {
  apiLatency: 250,
  stpStep: 450,
  stpSettle: 350,
  /** A new signal arrives every … ms after the app opens (threshold is hit at the 5th). */
  signalInterval: 1500,
  /** How often the app asks for the latest moment (the backend advises polling every 1–2 s). */
  momentPoll: 1500,
};
