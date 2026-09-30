# Developer-prompt: "Mijn wereld" (Kate · Gezinsuitbreiding)

> Plak deze prompt in Lovable, Cursor of Claude Code, of geef hem aan je developer. Voeg het bestand **mijn-wereld-prototype.html** toe als bijlage. Dat bestand is de visuele bron van waarheid: alle SVG-tekeningen, kleuren, copy en animaties staan erin.

---

## Opdracht

Bouw het scherm **"Mijn wereld"** voor KBC Mobile na als productiecomponent, op basis van het bijgevoegde prototype (`mijn-wereld-prototype.html`). Neem design, layout en UX 1-op-1 over. Herschrijf het als nette componenten met state management. Verzin geen nieuwe stijl.

**Stack (tenzij anders afgesproken):** React + TypeScript + Tailwind. Geen externe UI-library nodig. SVG inline als React-componenten.

## Wat het scherm doet

Een klant ziet zijn leven als een zwevend eiland in 3D-cartoonstijl. Elk object is een levensdomein. Kate (de AI-assistent) volgt signalen, herkent een levensmoment (hier: **gezinsuitbreiding**), vraagt het eerst na, en maakt dan een checklist die ze per punt zelf uitvoert (Straight-Through Processing).

Persona in de demo: **Tom & Lien, 32**. Ze hebben een huis met een KBC-woonkrediet en een auto die bij KBC verzekerd is, en nog geen kinderen.

## Layout

Er zijn twee kolommen op desktop en één kolom onder 860px.

1. **Links: telefoonframe** (390 × 812, afgeronde rand 52px, sticky). Onder 430px valt de bezel weg en wordt het scherm fullwidth.
2. **Rechts: pitchpaneel** met eyebrow, titel, lead, de 3 demostappen (de actieve stap licht op), het **backoffice-paneel** (score, drempel, signalenlijst, knoppen) en de KBC-pijlers.

In de echte app is enkel de telefooninhoud het product. Het rechterpaneel wordt een aparte **backoffice-/demoview**.

## Componenten (telefoon)

| Component | Inhoud |
|---|---|
| `StatusBar` | 9:41 · KBC Mobile |
| `Header` | "Hallo Tom & Lien", titel "Mijn wereld", `KateCoinBadge` (saldo, pop-animatie bij stijging) |
| `IslandScene` | SVG 360×300: eiland, wolken, huis (Wonen), windmolen (Energie), muntenboom (Sparen), auto + laadpaal (Mobiliteit), Tom & Lien (Gezin), vijver, zwevende `KateLogo`. Elk domein is een klikbare hotspot met badge (pil + optioneel groen vinkje). |
| `KateCard` | Kate-logo + tekst + acties. De inhoud hangt af van de state (zie hieronder). |
| `DomainTiles` | 2×2 grid: Wonen, Mobiliteit, Gezin, Sparen, met statuschip (ok / warn / info) |
| `TabBar` | Mijn wereld · Rekeningen · Kate · Meer |
| `BottomSheet` | Detail per domein, "Waarom vraag je dit?" en de checklist "Klaar voor de geboorte" |

Neem **alle SVG-paden, gradients en filters letterlijk over** uit het prototype. Het Kate-logo staat als `<symbol id="kateLogo">`.

## State machine

```
signals ──(score ≥ 70)──▶ ask ──Bevestigen──▶ confirmed ──(alle todo's klaar)──▶ done
                            └──Klopt niet──▶ declined (inschatting gewist)
```

| State | Eiland | KateCard | Gezin-tegel |
|---|---|---|---|
| `signals` | Tom & Lien, huis ✓, auto ✓ | "Alles staat goed…" + 'Op jouw maat'-chips | chip "2" |
| `ask` | Gestippeld babyfiguurtje verschijnt (pulserend) | "Ik vermoed dat er een **gezinsuitbreiding** op komst is bij jullie. Klopt dat?" · Bevestigen / Klopt niet / Waarom? | chip "?" (warn) |
| `declined` | Gestippeld figuurtje verdwijnt | "Bedankt om het te laten weten. Ik stop met deze suggesties en wis deze inschatting." | terug naar "2" |
| `confirmed` | Baby wordt een echt figuurtje en er verschijnt een hartje | "Proficiat! 3 dingen zijn al in orde, nog X te regelen." · Bekijk checklist | "2 + 1" |
| `done` | Schommel in de boom, +100 Kate Coins | "Alles is geregeld…" | chip "klaar" (ok) |

## Checklist "Klaar voor de geboorte" (bottom sheet)

**Al in orde** (groen, vinkje):
- Woonverzekering: huis en inboedel verzekerd, ook de nieuwe babyspullen
- Autoverzekering omnium: kind als passagier automatisch meeverzekerd
- Spaarbuffer € 12.400: dekt ruim 3 maanden vaste kosten

**Nog te regelen** (oranje, gestippelde cirkel). Elk punt heeft de knop **"Laat Kate dit doen"**:

| id | Topic | Bouwt op | Prijs | STP-stappen |
|---|---|---|---|---|
| t1 | Schuldsaldoverzekering bijwerken | Woonkrediet | + € 9/mnd | Dekking herberekend · Polis aangepast |
| t2 | Familiale verzekering afsluiten | Woonverzekering | + € 7/mnd | Gebundeld met woonverzekering · Actief vanaf geboorte |
| t3 | Baby meeverzekeren in hospitalisatie | Gezinssamenstelling | + € 8/mnd | Aanvraag klaargezet · Start bij aangifte geboorte |
| t4 | Groeipakket aanvragen | Beyond Banking | gratis | Formulier ingevuld · Klaar om te versturen |
| t5 | Spaarplan 'Kleine spruit' openen | Spaarrekening | € 50/mnd | Spaarplan geopend · Doorlopende opdracht ingesteld |

Gedrag:
- Een klik op "Laat Kate dit doen" toont de stappen één voor één (±450ms per stap) met een groen vinkje. Daarna kleurt het item groen met "Geregeld door Kate".
- De teller "x/5 geregeld" loopt live mee.
- De knop "Laat Kate alles regelen" voert de open items na elkaar uit.
- Zijn alle 5 punten klaar, dan gaat de state naar `done` en wordt de knop "Klaar".

## Backoffice / moment engine

- Score "Gezinsuitbreiding" van 0 tot 100%, met drempel op **70%** (gestippelde lijn).
- Signalen (mock, later via API):

```json
[
  {"date":"2027-03","label":"Spaarrekening hernoemd naar 'Kleine spruit'","source":"App-gedrag","weight":18},
  {"date":"2027-04","label":"Aankoop bij babyspeciaalzaak · € 389","source":"Transactie","weight":20},
  {"date":"2027-04","label":"Simulatie gezinswagen in KBC Mobile","source":"App-gedrag","weight":14},
  {"date":"2027-05","label":"Vraag aan Kate over het Groeipakket","source":"Kate-gesprek","weight":12},
  {"date":"2027-05","label":"Betaling inschrijving kinderopvang","source":"Transactie","weight":16}
]
```

- Knoppen: "Speel volgend signaal", "Speel alles af" (900ms interval) en "Demo resetten".
- De statusregel toont wat Kate doet ("Onder de drempel: Kate blijft stil", "Drempel bereikt…", "Kate voerde uit via STP: …").

## Design tokens

```css
/* fonts */
--display: "Fredoka";   /* 500/600/700, titels, badges, tegels */
--body: "Nunito";       /* 400–800 */

/* telefoonwereld (vaste daglook) */
--w-ink:#12305a; --w-soft:#6b7f99; --w-card:#ffffff; --w-blue:#0a5fb4; --w-good:#1f9d55;
sky: linear-gradient(180deg,#8fd0ff 0%,#cdeeff 42%,#f4f8fc 42.1%);
chip ok #e4f6eb/#157a42 · warn #fff0df/#b65b00 · info #e6f0fb/#0a5fb4
Kate-logo: ringen #b3e0f5 / #e2f2fc / #f1f8fe, streepjes #009fe3

/* pagina (licht / donker) */
--bg:#eef3f9 / #0c1522; --fg:#0f2138 / #e8eef7; --muted:#5a6b82 / #98a8bf;
--line:#d5dfeb / #223249; --accent:#0a5fb4 / #6fb2ff;
```

Stijlregels: kaarten hebben een radius van 18–22px met een zachte "3D"-schaduw (`0 4–6px 0 rgba(12,60,120,.08)`). Knoppen zijn pillen, en de primaire knop heeft een harde onderschaduw `0 3px 0 #073f78`.

## Animatie

- Het eiland beweegt zacht op en neer (5s), de wolken drijven (22s), de windmolen draait (6s) en het Kate-logo beweegt op en neer (3.2s).
- Het gestippelde babyfiguurtje "ademt" (opacity 2.4s).
- De bottom sheet schuift omhoog met `cubic-bezier(.2,.9,.3,1.1)`.
- Alles respecteert `prefers-reduced-motion`.

## Trust & privacy (verplicht)

- Kate gebruikt alleen signalen waarvoor toestemming is gegeven via **'Op jouw maat'**. Toon dat met chips.
- **Geen gezondheidsdata** als signaal.
- Er komt nooit een voorstel zonder bevestiging van de klant.
- "Waarom vraag je dit?" toont de signalen in klanttaal.
- Bij "Klopt niet" wordt de inschatting gewist en stopt Kate met deze suggesties.

## Acceptatiecriteria

1. Visueel identiek aan het prototype, op desktop en op 390px breed.
2. Alle 5 states zijn bereikbaar en resetbaar.
3. Elk todo-item is afzonderlijk uitvoerbaar. "Alles regelen" werkt ook als er al items klaar zijn.
4. Hotspots en tegels werken met toetsenbord (Enter/Spatie) en hebben een zichtbare focus.
5. De mockdata staat in één bestand (`mocks/tomEnLien.ts`), zodat die later vervangen kan worden door API-calls.
6. Geen console errors.
