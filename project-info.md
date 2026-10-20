# Project info & plan: "Mijn wereld", phase 2

This is the high-level plan for phase 2 of the KBC Mobile hackathon app. It holds the product decisions, the experience spec, the architecture and the build order. The code shows the current state; this file shows where it is going.

- When this file and the code disagree, this file wins for phase-2 work.
- When a decision changes, update the [decision log](#2-decision-log) and the section it affects in the same edit.
- Items marked **proposal** were filled in by Claude and still need the user's confirmation. Items in [Open questions](#11-open-questions) are blocked on the user: ask instead of choosing.
- **The backend is the source of truth for data.** It lives in `../backend`. Its integration guide is `../backend/AGENTS.md`, and the ecosystem engine is `../backend/src/ecosysteem.ts` with its catalogue in `../backend/src/catalogus.ts`. When the backend changes, re-check [section 6](#6-data--api) and the mapping tables in [4.4](#44-from-backend-links-to-places).
- Before writing code that touches Expo or React Native APIs, follow the doc-check rule in `AGENTS.md`. API names in this plan were checked against `node_modules` (expo 57.0.25) and the Expo DOM components guide on 2026-10-20.

**Contents**
1. [Context](#1-context)
2. [Decision log](#2-decision-log)
3. [Glossary](#3-glossary)
4. [Experience spec](#4-experience-spec)
5. [Architecture](#5-architecture)
6. [Data & API](#6-data--api)
7. [Build plan](#7-build-plan)
8. [Verification](#8-verification)
9. [Risks](#9-risks)
10. [Demo script](#10-demo-script)
11. [Open questions](#11-open-questions)

---

## 1. Context

**Phase 1 (done)** built "Mijn wereld" for KBC Mobile: a floating cartoon island with life domains (Wonen, Mobiliteit, Energie, Sparen, Gezin). Kate, the AI assistant, followed consented signals, recognised the life moment *gezinsuitbreiding*, asked the customer to confirm, and executed a birth checklist through Straight-Through Processing. The spec is `developer-prompt-mijn-wereld.md` and the visual prototype is `mijn-wereld-prototype.html` / `image.png`.

**Phase 2 (this plan)** centres on **the customer's world**. The backend groups everything KBC knows about a customer into **ecosystems** (Wonen, Mobiliteit, Reizen, …). Each ecosystem holds **links** to KBC products and partner brands, and each link has one of three statuses:

| Backend status | Meaning | In the world |
|---|---|---|
| `actief` | A KBC product the customer holds, or a partner that shares data with KBC | A **linked** place: fully drawn and branded |
| `gekend` | A partner KBC knows the customer uses (seen on the account or in KBC Mobile), without data sharing | A **ghost** place: drawn dotted, inviting the customer to connect |
| `mogelijk` | A product or partner that KBC's rules think the customer might need | A **tip**: Kate suggests it. A whole new ecosystem shows as an empty **plot** where the world can grow |

The street turns this into a picture:
- the customer's house
- a KBC bank
- a Q8 fuel station
- an NMBS station
- an island with Brussels Airport planes when they travel
- dotted places for partners they use but haven't connected
- empty plots with a Kate sign where Kate sees room to grow

When the customer connects a partner, confirms a life moment, or acquires a product, the street grows.

**Goal for the demo.** In under two minutes a jury sees:
1. a world that feels like *theirs* and opens with a cinematic fly-in
2. real brands they recognise
3. the world visibly growing when they connect a partner
4. Kate explaining what she found and what could come next

**Success criteria**
- Opening the screen always plays the fly-in, and it lands on the customer's household.
- Tom's world, built from the live backend (commit `cc209bb`, D23), shows:
  - linked: KBC, Joyn, NMBS, Immoscoop, and VAB on the car
  - dotted: Cambio, Brussels Airport, and De Immowinkel on the house
  - empty plots: Energie, Beleggen, Pensioen
- Connecting a dotted partner turns it linked in under 2 seconds, with the transition visible. Connecting a partner that was only a tip makes a new place rise out of the ground.
- A change on the backend (connect, consent, a confirmed moment) shows within one polling interval.
- The Kate bar reads at a glance as "chat with Kate", keeps cycling what Kate found, and one tap opens the chat about the finding it shows.
- It runs on web (390px and inside the phone frame), the iOS simulator and an Android device, with no console errors.

## 2. Decision log

U = decided by the user, P = proposal by Claude (confirm before treating it as fixed). All dated 2026-10-20. The user accepted every proposal up to D22 on 2026-10-20.

| # | Decision | Choice | By | Why |
|---|---|---|---|---|
| D1 | How the world is navigated | **Horizontal street** scrolling left → right, home at the far left | U | Reads as a journey from home outward, and distance from home becomes distance on screen |
| D2 | Avatar format | **SVG React components**, one folder per category | U | Same cartoon-3D style as phase 1, and one drawing serves every state |
| D3 | Phase-1 content | **World replaces the island; Kate stays** (chat, coins, voice; the orb gave way to the Kate bar, D14). The family moment becomes one world event | U | Keeps Kate's value, makes the world the hero |
| D4 | Tapping a ghost | **Partner sheet with Koppel**. Koppel is the backend's `PUT K/partners/:partner {deelt: true}` (D18) | U | The demo shows the world growing because of the customer's own action |
| D5 | Partners | **Real brands**, as listed in the backend catalogue (40 partners: Q8, NMBS, De Lijn, Cambio, Brussels Airport, Joyn, …) plus KBC itself. Engie, wanted for the windmill, isn't in the catalogue yet (Q2) | U | Recognisable for the jury, and a believable "beyond banking" world |
| D6 | Screen proportions | **The world fills the first view** down to the Kate bar; finding cards and text sections follow when the page scrolls. (Was: world ≥ 80% of the first view, changed 2026-10-20) | U | The world is the hero; text is secondary |
| D7 | Opening animation | **Fly-in every time the screen opens**: from the sky, circling down, focusing on the customer | U | A memorable, emotional first moment |
| D8 | Rendering | The world is one **Expo DOM component** (`'use dom'`) with plain SVG and CSS, as phase 1's `IslandScene` | U | Reuses phase-1 art and animations, and keeps the ghost look to a single CSS class. Identical on web, iOS and Android |
| D9 | When a place counts as new | Seen links (`linkId:status`) are kept in AsyncStorage. A place with an unseen `actief` or `gekend` link is new once, and the first launch marks everything seen | U | Only real arrivals celebrate, including ones that happened since the last visit |
| D10 | Kate findings source | Built in the app from the backend links (`mogelijk` → tips, `gekend` → connect, newly `actief` → arrived) and the moment, in one selector | U | The backend computes the reasoning; the app only words and orders it |
| D11 | Brand rendering | Brand name and colours on **drawn** signage in our style; no logo image files | U | Keeps one visual style across the world |
| D12 | ~~Proposed brands (Colruyt, TheFork, Kinepolis, TUI, Booking.com, Brussels Airlines)~~ | Superseded by D5/D18: brands come from the backend catalogue | — | — |
| D13 | Text section | "Mijn wereld in tekst": the customer's ecosystems with their links and statuses, plus account links | U | Secondary overview, and the accessible version of the world; see Q4 |
| D14 | Kate's entry point | The **Kate bar** replaces the Kate orb: a horizontal bar directly under the world that looks like an AI chat input and keeps animating with what Kate wants to tell the customer | U | It's obvious you can talk to Kate, and her findings get a visible, living home |
| D15 | Findings below the bar | **Bar + cards**: the bar rotates short teasers; full finding cards with their buttons follow below it | U | The bar invites; the cards let the customer act |
| D16 | Tapping the bar | Opens the **Kate chat with the shown finding as Kate's first message**. Until the chat page supports that, it opens the plain chat | U | One tap from a hint to a conversation about it |
| D17 | Bar position | **Fixed right above the tab bar**; only the page above it scrolls. (Was: in the page flow with a docked copy, changed 2026-10-20) | U | Kate stays one tap away, as the orb was |
| D18 | Data model | The world is built from the backend's **ecosystem clusters** (`GET K/ecosystemen`) and **partner relations** (`GET K/partners`). The statuses map one-to-one: `actief` → linked, `gekend` → ghost, `mogelijk` → tip or plot | U | The backend is done; the app draws what it computes |
| D19 | Mapping | Every backend partner and ecosystem maps to a drawn **category**, as its own place or as an **attachment** on another place, in one table (4.4) | U | 40 partners as 40 buildings would make an endless street; attachments keep it readable |
| D20 | New ecosystems | An ecosystem with only `mogelijk` links (`samenvatting.nieuweEcosystemen`) shows as an empty **plot** with a Kate sign at its anchor's spot | U | Matches the backend's intent ("that's where the world can grow") and makes growth visible before it happens |
| D21 | Which tips Kate mentions | `mogelijk` links with score ≥ 0.35, at most one per place or plot (the highest), top 3 in the Kate bar | U | The backend shows from 0.25; a higher bar keeps Kate focused |
| D22 | Places the backend can't feed | Restaurant, cinema, hotel and workplace are **on hold** until the backend has data for them (Q2) | U | A ghost with nothing to connect would be a dead end |
| D23 | Backend drift | **Follow the live backend as it is.** Commit `cc209bb` (2026-10-20) reworked Tom & Lien (they rent; no Q8 or Setle; Immoscoop, VAB and De Immowinkel instead) and seeded Jonas. The Tom table (4.4), the success criteria and the demo script follow it | U | The backend is the source of truth |
| D24 | Chat opener | Built in `poc-runner/chat` in the same round: `POST /api/kate/opener`, the URL's `opener`/`finding` on first open, a `kate:opener` message after that. Kate's opener stays in the chat history, so the model has the context | U | Closes Q8; one tap from a finding to a conversation about it (D16) |
| D25 | Where category metadata lives | Label, zone and width per category sit in `world/categories.ts` (one table), not in a `meta.ts` per avatar. `avatars/index.ts` adds each drawing's anchors (top, Kate flag, attachments) | P | One mapping table, as 4.4 asks; avatars stay pure drawings |
| D26 | Ghost look | Dashed outline (`#7f9cc0`) over a faint white silhouette of the same drawing (4.6). (Was: no fill, `#9db4cf` dashes, changed 2026-10-20) | U | Ghosts all but disappeared on the grass |
| D27 | Ambient life | **Lively**: shaded clouds in two depths, birds, a hot-air balloon, sun rays, people on a footpath, chimney smoke, the NMBS train, sparkles on the sea (4.8). Every loop is a cheap transform or opacity change, stops with reduced motion, and pauses while the world is scrolled out of view (web) | U | The world should shine; an empty sky and lawn read as unfinished |
| D28 | Avatar scope for this round | New art for every placeholder in Tom's and Jonas' worlds (shop, estate agency, train station, stock exchange, business, bench), plus upgrades to the existing avatars. The other nine categories stay placeholders (M7) | U | No placeholder in the demo, without drawing categories nobody has yet |
| D29 | Kate's ✕ in the chat | The app always opens the chat with `close=0`, which hides the chat page's ✕ (new conversation): the app's own ✕ closes the chat, and two ✕s read as two close buttons | U | One way out of the chat |

## 3. Glossary

Use these words in code, comments and copy discussions. Backend terms stay Dutch, as in the API.

**Backend terms**
- **Ecosystem** (`ecosysteem`): one of the backend's 21 groupings (`WONEN`, `MOBILITEIT`, `REIZEN`, …). Per customer, the backend returns one **cluster** per ecosystem the customer touches.
- **Link**: one product or partner inside a cluster, with status `actief`, `gekend` or `mogelijk`, a `herkomst` (where KBC knows it from), and for `mogelijk` a `score` and `waarom` (the reasons).
- **Partner**: a real brand from the backend catalogue (Q8, NMBS, Cambio, …). KBC itself is the bank behind every KBC product.

**World terms**
- **Category**: a kind of thing we draw (`house`, `fuel-station`, `island`, …). Backend partners and ecosystems map onto categories in one table (`world/categories.ts`).
- **Avatar**: the SVG drawing for one category, in its own folder.
- **Place**: an avatar on the street. It gathers every `actief` and `gekend` link that maps to its category. Its state is one of:
  - **linked**: at least one `actief` link. Fully drawn and branded.
  - **ghost**: only `gekend` links, or an essential with no links. Drawn dotted. A known partner's name shows faintly; an essential without a partner has no brand.
  - **plot**: an ecosystem with only `mogelijk` links. Drawn as an empty lot with a Kate signpost (D20).
  - A place can also be flagged **new**: it has a link the customer hasn't seen yet, and it plays the arrival animation once.
- **Attachment**: a partner drawn as a detail on another place rather than as its own building: Setle scaffolding on the house, a VAB badge on the car, payment logos on the bank.
- **Anchor**: the place where an ecosystem's KBC products land (WONEN → house, DAGELIJKS_BANKIEREN → bank, REIZEN → island).
- **Shield**: the KBC insurance badge on the place an insurance protects.
- **Tip**: a `mogelijk` link. Kate mentions it, and its place or plot carries a small Kate flag.
- **Essential**: a category that always has a place, as a ghost until linked: `house`, `shop`.
- **Zone**: a stretch of the street, ordered by distance from home: `home` → `neighbourhood` → `town` → `away`.
- **Household**: the people at the house: the customer alone, or with partner and/or baby.

**Kate terms**
- **Fly-in**: the camera animation that opens the world.
- **Arrival**: the animation of a new place appearing.
- **Finding**: one thing Kate wants to tell the customer about their world. Its short teaser rotates in the Kate bar; its full text is a card below.
- **Kate bar**: the horizontal, chat-input-like bar fixed right above the tab bar, directly under the world in the first view. It rotates finding teasers and opens the Kate chat.
- **Opener**: the message Kate starts the chat with when the customer taps a finding.

## 4. Experience spec

### 4.1 Screen anatomy

The Kate bar is fixed right above the tab bar. Everything above it scrolls **vertically**: the world, which fills that whole area in the first view, then the finding cards and the text section. The world inside band 1 scrolls **horizontally**.

```
┌──────────────────────────────┐ ─┐
│ HALLO TOM & LIEN     🪙 860  │  │  Header: native, floats over the sky
│ Mijn wereld                  │  │
│      ☁        ✈        ☁     │  │
│   ▲▲  hills / skyline  ▲▲    │  │  1 · WORLD BAND
│ 🌀🏠👨‍👩‍👧 🚗 ┆🚙┆ 🏦KBC 🛒Joyn →│  │     fills the first view
│ ▔▔▔▔▔▔▔▔▔ road ▔▔▔▔▔▔▔▔▔▔▔▔▔ │  │     street scrolls horizontally
│  🌳     🚌             🌳    │  │
│ ● Thuis ○ Buurt ○ Stad ○ Reis│  │  Zone strip: fixed
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┤ ─┘  ↓ scrolling up brings in:
┊ KATE VOND                    ┊     3 · FINDING CARDS
┊ ┌ Een energielening? …     ┐ ┊
┊ │ [Vraag Kate] [Bekijk]    │ ┊
┊ Mijn wereld in tekst         ┊     4 · TEXT SECTION (proposal)
┊ Wonen · Woonkrediet · actief ┊
├──────────────────────────────┤
│╭────────────────────────────╮│     2 · KATE BAR: fixed, looks like a chat
││(K) Je liet Setle je     ➤ ││         input, rotates finding teasers
││    renovatie schatten… •●•││
│╰────────────────────────────╯│
├──────────────────────────────┤
│ Mijn wereld  Rekeningen  …   │     Tab bar (phase 1, unchanged)
└──────────────────────────────┘
```

| Band | Size | Content |
|---|---|---|
| 1 · World | The scroll area's height (screen − Kate bar band − tab bar), at least 320px. Inside the 390×812 web phone frame that comes to about 650px | The world (DOM component). The native Header is overlaid at the top, inside the safe area. The zone strip is a fixed overlay inside the DOM component |
| 2 · Kate bar | 56px tall, 10px above and below, on `world.ground`; always visible | See [4.9](#49-kate-bar-and-findings). Fixed above the tab bar (D17) |
| 3 · Finding cards | Content height, starting 16px under the world | 1–3 finding cards, then "Toon meer" if there are more |
| 4 · Text section | Content height | See [4.10](#410-text-section-proposal) |

In the 812px phone frame the sum works out as: tab bar ≈ 84px, Kate bar with its margins 76px, world ≈ 652px. The finding cards don't peek into the first view; the bar's rotating teasers point to them.

- The domain tiles from phase 1 are dropped. `SkyBackground` is dropped too, because the sky is part of the world.
- The status bar on native stays dark-on-light, as in phase 1.

### 4.2 The world: coordinate system and layers

The world draws in **world units**. It's **600 units tall**, scaled to the band height (scale = bandHeight / 600, so 1 unit ≈ 1px in the phone frame). Its width is the sum of the zones. All numbers below are starting values to tune by eye.

| Layer (back → front) | y-range | Scrolls with street at | Content |
|---|---|---|---|
| Sky | 0–600, fixed | 0× (fixed) | Gradient `#8fd0ff → #cdeeff` (phase-1 `world.skyTop/skyBottom`), sun |
| Clouds | 40–260 | 0.3× | Shaded cumulus in two depths (`scene/Cloud.tsx`), birds, the hot-air balloon |
| Far range | 300–430 | 0.35× | Soft mountains on the horizon |
| Plane lane | 90–170 | 0.6× | The plane, when the customer has a Brussels Airport link |
| Back layer | 230–420 | 0.5× | Rolling hills with little trees on the crests, a village with a church tower past home, a skyline with lit windows in town, the horizon line at sea |
| Main row | ground line **y = 420** | 1× | Places and plots standing on the ground line |
| Road | 420–505 | 1× | Curb, road with dashes and edge lines, the lawn with a footpath (y 490) where people walk; the sea surface with sparkles and foam in `away` |
| Foreground | 460–600 | 1.15× | Trees, the household figures, the car, the passing De Lijn bus, waves |
| Overlays (fixed) | — | — | Zone strip (bottom, y 560–590) |

The header overlays roughly y 0–110 of the world. Places are kept below y 180 so the header never covers them.

### 4.3 Zones and layout

- **Order** left → right: `home`, `neighbourhood`, `town`, `away`. Within a zone, places follow the order of the category table in [4.4](#44-from-backend-links-to-places).
- **Growth rule**: a zone renders when it holds at least one place or plot, ghosts included. `home` and `neighbourhood` therefore always render, because they hold the essentials. `town` and `away` appear with their first link.
- **Spacing**: each zone has 40 units of padding on both sides and 24 units between places. Between zones a **connector** marks the transition: a road sign "Buurt"/"Stad" between land zones, and a 320-unit stretch of open sea (boats, waves) before `away`, so the island reads as far away.
- **First view**: on a 390-unit-wide viewport the whole `home` zone is visible, and the first place of `neighbourhood` peeks in at the right edge to show the street continues. (That held for the ~600px band; since the world fills the first view (D6) the street is drawn larger, about 650px in the phone frame, and the peek is lost.)
- **Stable layout**: the same data always lays out the same way. When a place arrives, the places to its right slide over (400ms ease-out) before the arrival plays.

### 4.4 From backend links to places

All mapping lives in `world/categories.ts`, the single table between the backend and the drawing. A backend id the table doesn't know produces no place and a dev-only `console.warn`.

#### Categories (what we draw)

| Category | Avatar | Zone | Width | Anchor of ecosystem(s) | Essential |
|---|---|---|---|---|---|
| `house` | House with solar panels (phase-1 `Huis`) | home | 170 | `WONEN` | ✓ |
| `household` | Customer, + partner, + baby (phase-1 `Gezin`), in the foreground in front of the house | home | 90 | `GEZIN`, `GEZONDHEID` (shields only) | always linked |
| `energy` | Windmill with a small solar field (phase-1 `Windmolen`) | home | 80 | `ENERGIE` | |
| `coin-tree` | Coin tree (phase-1 `Boom`); gold fruit for `VERMOGEN` | home | 90 | `SPAREN`, `VERMOGEN` | |
| `bench` | Park bench under a big oak | home | 80 | `PENSIOEN` | |
| `car` | Car on the driveway with a charge point (phase-1 `Auto`) | home | 110 | `MOBILITEIT` | |
| `bank` | Bank with columns and a KBC sign | neighbourhood | 140 | `DAGELIJKS_BANKIEREN` | |
| `shop` | Shop with an awning and a trolley | neighbourhood | 150 | `WINKELEN` | ✓ |
| `car-share` | Two shared cars under a sign | neighbourhood | 90 | — | |
| `bike-station` | Rack with shared bikes | neighbourhood | 100 | — | |
| `bus-stop` | Shelter; a De Lijn bus passes now and then | neighbourhood | 90 | — | |
| `telecom-shop` | Phone shop with an antenna on the roof | neighbourhood | 110 | — | |
| `newsstand` | Kiosk with newspapers | neighbourhood | 70 | — | |
| `estate-agency` | Agency window with house listings | neighbourhood | 110 | — | |
| `post-office` | Post office with a big letterbox | neighbourhood | 110 | `ADMINISTRATIE` | |
| `watchtower` | Small tower with a KBC shield (proposal, Q3) | neighbourhood | 70 | `VEILIGHEID` | |
| `fuel-station` | Canopy with pumps and a price board | town | 150 | — | |
| `train-station` | Station building, platform, a passing train | town | 190 | — | |
| `metro` | Metro entrance with an M sign | town | 80 | — | |
| `parking` | Parking garage with a P sign | town | 120 | — | |
| `stock-exchange` | Small exchange building with a ticker board | town | 140 | `BELEGGEN` | |
| `business` | The customer's own company: an office with a shop front | town | 170 | `ONDERNEMEN`, `BESCHERMING_ONDERNEMING`, `WERK`, `INTERNATIONAAL` | |
| `farm` | Barn and greenhouse at the edge of town | town | 180 | `LANDBOUW` | |
| `airport` | Terminal on the coast, with the plane in the plane lane | away | 200 | — | |
| `island` | Island across the sea, palm tree, beach | away | 260 | `REIZEN` | |

`DIGITAAL` (KBC Mobile, Kate) and `INTEGRATIES` (B2B) never become places: the app and the Kate bar *are* that ecosystem.

#### Partners (all 40 in the catalogue)

| Partner id(s) | Backend ecosystem | Drawn as |
|---|---|---|
| `q8` | MOBILITEIT | own place: `fuel-station` |
| `nmbs` | MOBILITEIT | own place: `train-station` |
| `de-lijn` | MOBILITEIT | own place: `bus-stop` |
| `mivb` | MOBILITEIT | own place: `metro` |
| `cambio` | MOBILITEIT | own place: `car-share` |
| `blue-bike`, `velo-antwerpen`, `mobit` | MOBILITEIT | shared place: `bike-station` (signs stacked) |
| `q-park`, `4411` | MOBILITEIT | shared place: `parking` |
| `vab` | MOBILITEIT | attachment on `car` (VAB badge, the yellow van parked beside it) |
| `movesmart` | MOBILITEIT | attachment on `car` (lease plate) |
| `brussels-airport` | REIZEN | own place: `airport` (+ the plane) |
| `firsty` | REIZEN | attachment on `island` (signal mast) |
| `setle` | WONEN | attachment on `house` (scaffolding) |
| `impact-us-today` | WONEN | attachment on `house` (workman's van) |
| `de-immowinkel` | WONEN | attachment on `house` (inspection sign) |
| `immoscoop` | WONEN | own place: `estate-agency` |
| `encon`, `kube`, `sweco` | ENERGIE | attachment on `energy` |
| `joyn` | WINKELEN | own place: `shop` (loyalty sign) |
| `proximus`, `orange`, `base` | WINKELEN | shared place: `telecom-shop` |
| `de-tijd`, `vrt-nws` | WINKELEN | shared place: `newsstand` |
| `bolero` | BELEGGEN | own place: `stock-exchange` |
| `billit`, `soluz-io`, `go-solid`, `bancontact`, `nowjobs` | ONDERNEMEN / WERK | attachment on `business` (invoice printer, payment terminal, workers) |
| `paypal`, `wero`, `apple` | DAGELIJKS_BANKIEREN | attachment on `bank` (payment signs) |
| `ipex` | ADMINISTRATIE | own place: `post-office` |
| `helena`, `leadlife`, `kom-op-tegen-kanker` | `gevoelig: true` | **never drawn** (4.12) |

A shared place takes its state from the best of its partners and shows each partner's sign.

#### KBC products

- A product link lands on the **anchor** of its ecosystem. A product with `partners` in the catalogue lands on that partner's place instead.
- **Insurance products become shields** on their anchor:

  | Shield | Products |
  |---|---|
  | house | `home-insurance`, `home-assistance-insurance`, `outstanding-balance-insurance` |
  | car | `car-insurance`, `electric-car-insurance`, `bicycle-insurance`, `moped-insurance`, `motorcycle-insurance` |
  | household | `family-insurance`, `life-insurance`, `accident-insurance`, `funeral-insurance`, `hospitalisation-insurance`, `kbc-hospital-care` |
  | island | `travel-insurance` |
  | business | the `BESCHERMING_ONDERNEMING` products |
  | watchtower | `online-fraud-insurance` |

  An insurance alone is enough to link its place.
- Products with `kanaal: "B2B"` are never shown.

#### State rules

1. A place's state is the best status among its links: `actief` → linked, `gekend` → ghost.
2. An attachment carries its own state: a dotted VAB badge on a solid car is fine.
3. An essential (`house`, `shop`) without any link is an unbranded ghost.
4. An anchor whose ecosystem has only `mogelijk` links is a **plot** (D20).
5. Other `mogelijk` links don't draw anything new. They're **tips** on the place where they would land, or on their ecosystem's anchor when that place doesn't exist yet. Example: Blue-bike's bike station doesn't exist yet, so its tip sits on the car.
6. The **island** mirrors its REIZEN cluster: it's linked or ghost when any REIZEN link (the airport included) is `actief` or `gekend`. An empty island reads wrong, so the airport's status carries over.
7. The **plane** flies when the `airport` place exists, and takes its state: a dotted plane for a `gekend` Brussels Airport.

#### Household

The backend has no household data yet (Q1). Until it does:
- adults come from the customer `naam`, split on " en " / " & " ("Tom en Lien" → 2)
- children are 0
- a confirmed `GEZINSUITBREIDING` moment adds the phase-1 dotted baby, and confirmation in the phase-1 flow makes it solid

#### Tom & Lien from the live backend

This is the expected result. `buildWorld` on the responses recorded from commit `cc209bb` (`mocks/world/tom.json`) gives exactly this on 2026-10-20.

| Zone | Place | State | From |
|---|---|---|---|
| home | `house` | linked; shield; De Immowinkel attachment ghost; tip | `home-insurance`, `rental-guarantee` (actief), `de-immowinkel` (gekend, KBC_MOBILE); top tip `calculate-housing-budget` 0.65 |
| home | `household` | linked; shields; 2 adults | `family-insurance`, `hospitalisation-insurance`; no tip ≥ 0.35 until the family moment is confirmed |
| home | `energy` | **plot** | ENERGIE only `mogelijk`: `calculate-solar-panels-and-request-a-quote` 0.48 |
| home | `coin-tree` | linked | `savings-accounts` |
| home | `bench` | **plot** | PENSIOEN only `mogelijk`: `pension-savings-fund` 0.58 |
| home | `car` | linked; shield; VAB attachment linked; tip | `electric-car-insurance`, `electric-car-loan`, `vab` (actief); top tip `blue-bike` 0.55 |
| neighbourhood | `bank` | linked | `kbc-plus-account`; `wero` tip 0.25 (below D21) |
| neighbourhood | `shop` | linked; tip | `joyn` (actief); top tip `digital-loyalty-cards` 0.40 |
| neighbourhood | `car-share` | ghost | `cambio` (gekend, REKENING) |
| neighbourhood | `estate-agency` | linked | `immoscoop` (actief) |
| town | `train-station` | linked | `nmbs` (actief) |
| town | `stock-exchange` | **plot** | BELEGGEN only `mogelijk`: `invest-spare-change` 0.44 |
| away | `airport` + plane | ghost | `brussels-airport` (gekend, REKENING) |
| away | `island` | ghost; tip | mirrors REIZEN; tip `travel-insurance` 0.46, and 0.66 once Brussels Airport is connected |

#### Jonas from the live backend

`mocks/world/jonas.json`, same commit.

| Zone | Place | State | From |
|---|---|---|---|
| home | `house` | ghost (unbranded essential) | no WONEN cluster |
| home | `household` | linked; 1 adult | "Jonas" |
| home | `energy` | linked; Encon and Kube linked, Sweco ghost; tip | `energy-loan`, `encon` (KLANT), `kube`, `sweco` (gekend); top tip `business-co2-insights-and-sector-comparison` 0.72 |
| home | `coin-tree` | **plot** | SPAREN only `mogelijk` (0.30: no Kate flag) |
| home | `bench` | linked; tip | `supplementary-pension-for-the-self-employed`; tip `individual-pension-commitment` 0.40 |
| home | `car` | ghost; MoveSmart attachment ghost | `movesmart` (gekend) |
| neighbourhood | `bank` | linked | `kbc-plus-account` |
| neighbourhood | `shop` | ghost (unbranded essential) | — |
| town | `business` | linked; "Stroomvaart BV" sign (`onderneming.naam`); Billit linked, Go Solid and NOWJOBS ghost; shield; tip | ONDERNEMEN, WERK, BESCHERMING_ONDERNEMING and INTERNATIONAAL products; top tip `guaranteed-income-insurance-for-the-self-employed` 0.55 |
| away | `island` | ghost; Firsty attachment ghost | `firsty` (gekend) |

### 4.5 Partners & brands

- **Drawn signage, real names**: the Q8 canopy, the NMBS sign above the station, the De Lijn bus livery, the KBC bank, the Joyn loyalty sign, Cambio cars. The lettering and shapes are SVG in the cartoon style. The name comes from the backend (`naam`); take the colours from each brand's own public site and record them in `world/partners.ts`.
- **The avatar stays brand-neutral.** It receives `brand: { name, colors }` as a prop and paints its sign with it, so a shared place (bike station, telecom shop) can carry several brands.
- **Ghost signage**: a `gekend` partner's name shows faintly in the dashed sign, because the customer recognises their own Cambio. An essential ghost without a partner has no sign.
- **Not in the catalogue**: Engie (windmill), restaurant, cinema and hotel brands, and the customer's employer. See Q2. Until then the windmill is the unbranded ENERGIE anchor.

`world/partners.ts` (shape; the hex values are filled in from the brand sites):

```ts
export const BRANDS: Partial<Record<PartnerId | 'kbc', BrandStyle>> = {
  kbc:   { colors: { primary: '…', secondary: '…', text: '…' } },
  q8:    { colors: { … } },
  nmbs:  { colors: { … } },
  'de-lijn': { colors: { … } },
  // every partner that draws signage; names come from the backend catalogue
};
```

### 4.6 Place states

```
                 PUT deelt:true (Koppel)
   ghost ─────────────────────────────────▶ linked
 (gekend / empty            ◀─────────────── (actief)
  essential)                PUT deelt:false (Stop delen) — back to ghost when KBC
                                              still knows the relation, gone when
                                              the customer had added it (herkomst KLANT)

                 Koppel a partner tip / product acquired
   plot or tip ───────────────────────────▶ linked + new  (arrival plays once)

   consent switched off (Op jouw maat)
   ghost from REKENING/KBC_MOBILE ────────▶ gone (the backend no longer "knows" it)
```

- A place disappears when its last link goes away. It fades out over 300ms, and the places to its right slide back. Essentials fall back to an unbranded ghost instead.
- The **ghost look** (D26) is the avatar drawn twice inside the ghost layer:
  - a white silhouette (`.ghostFill`): every shape white, at 50% group opacity, signage hidden
  - the dashed outline (`.ghost`) over it: fills `none`, stroke `#7f9cc0`, width 1.7, `stroke-dasharray: 5 4`, `filter: none`
  - signage at 40% opacity
  - the phase-1 `breathe` opacity animation (2.4s) on both
  - chimney smoke and the car's charging flow don't show on a ghost
- The **plot look** has its own small avatar, shared by every plot:
  - a patch of lighter grass with a low wooden fence
  - a signpost with the Kate logo and the ecosystem's Dutch name ("Energie?"), using the backend cluster `naam`
  - a soft sparkle every few seconds
- The **Kate flag** for tips is a small pennant with the Kate logo on the place's roof or signpost. It bobs at the phase-1 Kate rhythm (3.2s).

### 4.7 Fly-in

It plays **every time the Mijn wereld screen opens**: on first mount, after login, and whenever the screen regains focus (expo-router `useFocusEffect` on the native side bumps a `flyInKey` prop). It always plays before any arrival animation.

The camera is a CSS transform (translate, scale, rotate) on the world content group, with `transform-origin` at the household's centre. It's driven by CSS keyframes or the Web Animations API inside the DOM component.

| t | Camera translate (x, y) | Scale | Rotate | What the customer sees |
|---|---|---|---|---|
| 0.0s | (0, −520) | 0.6 | −8° | Only sky; big clouds fill the screen |
| 0.8s | (+220, −180) | 0.55 | −10° | The clouds part and rush past (they scale up and fade out to the sides); the whole street appears small, banking like a plane turning |
| 1.5s | (+120, −40) | 0.8 | +6° | Arcing around the home zone, coming down |
| 2.2s | (0, +30) | 1.8 | 0° | Close on the household; the figures wave (a 400ms arm rotation) |
| 3.0s | (0, 0) | 1.0 | 0° | Resting view, with the street scrolled to home |

- **Easing**: `cubic-bezier(.45,0,.2,1)` between keyframes; the last segment uses the phase-1 overshoot `cubic-bezier(.2,.9,.3,1.1)`.
- **The cloud bank** (`scene/FlyClouds.tsx`): ten shaded cumulus clouds in three depths, each its own composited HTML layer. From 0.1s they part outward from the centre, near clouds first and fastest (scale 2.5), far ones last (scale 1.5, fading early so none lingers over the street); the white haze clears in 0.7s and a flash of sunlight from the sun's position peaks around 0.9s. All clouds are gone by about 1.6s.
- **The wave**: at 2.1s the household hops and each adult raises the outer arm and waves (1.3s). The timer belongs to the flight, so a re-render during the flight doesn't cancel it.
- **Loading**: while the world data is still loading, the fly-in holds at 0.0s with the clouds drifting. The clouds are the loading state. The fly-in continues once the data is in.
- **Skip**: a tap anywhere jumps to the resting view.
- **During the fly-in**: horizontal scrolling and place taps are locked. They unlock on `onFlyInDone`.
- **Reduced motion**: the world fades in at the resting view (300ms), with no camera move.
- **Performance**: only the camera group and the cloud overlay animate (`will-change: transform`). Elements with SVG filters are never animated individually.

### 4.8 Other motion

| Animation | Spec |
|---|---|
| **Arrival** (new place) | After the fly-in, new places play one after another. For each: the street smooth-scrolls until the place is centred (600ms). The place grows from the ground line (scaleY 0 → 1.08 → 1, 500ms, `cubic-bezier(.2,.9,.3,1.1)`) in a burst of warm light (800ms), while 8 gold and white stars fly out from its centre (650ms), followed by a 600ms pause. As each place lands, its finding jumps to the front of the Kate bar (with the new-finding animation from 4.9) and to the top of the finding cards. The street stays at the last arrival. |
| **Plot → place** | The fence and signpost sink into the ground (250ms), then the arrival plays in the same spot. |
| **Ghost → linked** | The dashes close (dash offset animates to solid), fills fade in, and the signage goes to full opacity. Total 600ms. |
| **Linked → ghost** (stop sharing) | The reverse, 400ms. |
| **Layout shift** | Places to the right of an arrival slide over in 400ms, ease-out. |
| **Idle** | Clouds drift (26s near, 38s far), birds cross the sky (46s), the balloon bobs and drifts (6s, 40s), the sun's rays turn (90s), the windmill turns (6s, phase 1), the plane crosses its lane (14s loop), the De Lijn bus drives through the neighbourhood every ~20s, the train pulls in at the NMBS station every ~25s (the station clock's minute hand turns), people walk the footpath (a dog walker at home, a shopper in the neighbourhood, a cyclist in town), chimney smoke rises, the car's charging cable flows, coins and the sea glint, the stock ticker runs, the robin on the bench hops, plot seedlings sway, the household blinks, boats bob (4s), Kate flags bob (3.2s). The Kate bar's own motion is specified in 4.9. On web, every loop pauses while the world is scrolled out of view. |
| **Parallax** | Layers scroll at the factors in [4.2](#42-the-world-coordinate-system-and-layers). |
| **Reduced motion** | Scrolls jump instead of animating, arrivals appear without the overshoot, burst or sparkles, and idle loops and parallax stop. Things that travel stand still where they belong: walkers at the start of their stretch, the plane over the sea, the train at the platform. |

### 4.9 Kate bar and findings

Kate has two surfaces under the world:
- the **Kate bar** (D14), always one tap from a conversation
- the **finding cards** below it (D15), with the buttons to act on each finding

Both read from the same list of findings.

#### The Kate bar

```
╭──────────────────────────────────────────────╮
│ (K)  Je hebt een woonkrediet. Een            (➤) │
│      energielening om zuiniger te wonen? ○ ● ○   │
╰──────────────────────────────────────────────╯
```

**Look.** It has to read instantly as "I can talk to Kate here".
- A horizontal pill: full width minus 16px side margins, 56px tall, radius 28.
- Styled as a chat input: white, a 1px `world.line` border, the phase-1 card shadow.
- Left: the Kate logo (`KateLogoIcon`, 32px).
- Right: a round send button (➤), `world.blue` with the phase-1 primary hard shadow (`shadow.primary`).

**Content.**

| Situation | Middle of the bar |
|---|---|
| There are findings | The current finding's `teaser`: Nunito 700, 14px, `world.ink`, at most 2 lines with ellipsis. Under it, a dot per finding (max 5), the current one filled |
| No findings | A placeholder like an input's, "Vraag Kate iets over je wereld…", in `world.soft` |

**Motion.**

| Motion | Spec |
|---|---|
| **Rotation** | Every 6s the next teaser takes over: the outgoing one slides up and fades (250ms), the incoming one rises from below (300ms, `cubic-bezier(.2,.9,.3,1.1)`). Order follows finding priority |
| **New finding** | A finding that wasn't there before jumps to the front once. Three things happen together: <br>• two rings pulse out of the Kate logo (900ms, Kate colours `#b3e0f5` / `#009fe3`) <br>• the bar lifts 3px and settles back <br>• the teaser types in (30ms per character, capped at 1.2s) <br>On native, optionally a light haptic (`expo-haptics` would be a new dependency; check its SDK 57 docs first) |
| **Idle life** | The dashes in the Kate logo shimmer in a soft opacity wave every 3.2s (the phase-1 Kate bob rhythm), so the bar feels alive without news |
| **Pauses** | Rotation pauses while the bar is pressed or focused, while the chat is open, and while a screen reader is running |
| **Reduced motion** | Teasers swap with a 150ms crossfade every 8s; no pulse, lift, typing or shimmer |

**Tap.**
- The whole bar is one target: `role="button"`, `aria-label="Chat met Kate: {teaser}"`, or "Chat met Kate" when there's no teaser. Its rotating text is `aria-live="polite"` only for new findings, not for each rotation.
- A tap opens the Kate chat (`KateChat`). If a finding is showing, Kate starts with that finding's opener (see below). Without a finding, the chat opens plain.

**Position (D17).**
- The bar is fixed right above the tab bar, outside the scroll area, so it never covers page content. There is one bar, so no docking or second copy.
- Bottom sheets and the chat open above it.

#### Chat opener (D16)

- `KateChat` gets an `opener?: { findingId: string; text: string }` prop.
- The chat shows `text` as Kate's first message, and sends it along as conversation context, so a reply like "Ja, vertel meer" makes sense to the model.
- **Transport**: the chat view is created once and then kept. It's created ahead of time when a sheet opens or the Kate bar is pressed (so it isn't built while the panel slides in), otherwise on first open. So:
  - If the view is created by the open itself, the URL carries the opener: `?app=kate&close=0&opener=<url-encoded text>`. (`close=0` hides the chat page's own ✕, D29.)
  - Otherwise it's a `postMessage({ type: 'kate:opener', findingId, text })`: the iframe's `contentWindow.postMessage` on web, the WebView's message channel on native. It waits for the page to load.
  - The same opener twice while the chat is open (a double tap) is sent once; reopening the chat later says it again.
- **Dependency**: today `poc-runner/chat/public/index.html` reads no URL parameters and listens to no messages, so it needs a small change (Q8). Until then the chat opens plain, with no error. That's the fallback.
- The same opener serves the "Vraag Kate" button on finding cards.

#### Findings

Findings are built in the app from backend data by `selectFindings(world, moment)` (D10). The backend supplies the facts and the reasons (`score`, `waarom`); the app supplies Dutch wording and order.

Every finding carries three texts:

| Text | Where | Rule |
|---|---|---|
| `teaser` | Kate bar | ≤ 70 characters, says *what* and *why* in one breath, addressed to the customer |
| `text` | Finding card | 1–3 sentences, always naming the reason Kate is saying it |
| `opener` | Kate's first chat message | Picks up the teaser and invites a reply |

**Wording sources.**
- The backend's `waarom[].reden` is third person ("Vliegt via Brussels Airport"), so it fits the card's "Waarom?" list as is.
- For teasers and openers, the app keeps second-person phrases per `via` node in `world/labels.ts`. Examples:
  - `partner:brussels-airport` → "Je vloog via Brussels Airport"
  - `product:home-loan` → "Je hebt een woonkrediet"
  - `partner:setle` → "Je liet je renovatie schatten via Setle"

  A `via` without a phrase falls back to "Omdat je {naam} gebruikt".
- Product names in the catalogue are English, so `labels.ts` also holds Dutch names for the products the app shows (`travel-insurance` → "reisverzekering"), falling back to the English `naam` (Q5).
- Use "je" for a 1-adult household and "jullie" for 2 adults.

| Kind | From | Example teaser · card text · opener (Dutch) | Card buttons | Priority |
|---|---|---|---|---|
| `moment` | The phase-1 family moment is at `vragen` | "Ik vermoed een gezinsuitbreiding bij jullie. Klopt dat?" · the phase-1 KateCard text · "Ik zag enkele signalen die op een gezinsuitbreiding wijzen. Zal ik tonen welke?" | Bevestigen / Klopt niet / Waarom? (phase-1 behaviour) | 1 |
| `suggest` | A `mogelijk` link, within D21's limits | "Je hebt een woonkrediet. Een energielening om zuiniger te wonen?" · "Met jullie woonkrediet en de renovatieschatting van Setle kan een energielening interessant zijn." + "Waarom?" (the `waarom` reasons) · "Zal ik tonen wat een energielening bij KBC voor jullie renovatie kan betekenen?" | Vraag Kate / Bekijk / Niet nu; plus **Koppel** when the tip is a partner | 2 (by score) |
| `connect` | A `gekend` partner link | "Je gebruikt Cambio. Koppel het aan je wereld?" · "KBC ziet betalingen aan Cambio op je rekening. Laat je Cambio gegevens delen, dan staat het volledig in je wereld." (from `herkomst`: REKENING → "op je rekening", KBC_MOBILE → "in KBC Mobile") · "Zal ik Cambio voor je koppelen? Je kan het altijd weer stoppen." | Koppelen / Vraag Kate / Niet nu | 3 |
| `arrived` | A link that became `actief` this session | "Nieuw in jullie wereld: Brussels Airport." · "Brussels Airport deelt nu gegevens met KBC en staat in jullie wereld." · "Brussels Airport is gekoppeld. Wil je zien wat dat voor jullie reizen betekent?" | Bekijk / Vraag Kate | 4 (newest first) |
| `all-good` | No other finding | — (the bar shows its placeholder) · "Alles staat goed in jullie wereld." · — | — | 5 |

Rules:
- A finding that is new this session goes to the front of the bar once; after that, the bar follows priority.
- Cards: show the first 3, plus "Toon meer" when there are more. The cards use the phase-1 KateCard visuals (Kate logo, eyebrow "KATE VOND", text, pill buttons).
- Buttons:
  - **Vraag Kate** opens the chat with the opener.
  - **Bekijk** scrolls the street to the place and opens its sheet.
  - **Koppel(en)** runs the connect flow (4.11).
  - **Niet nu** and the card's ✕ dismiss the finding for the session (ids kept in memory).
- `suggest` limits (D21): score ≥ 0.35, one per place or plot (the highest), at most 3 in rotation.
- Scores move. Connecting Brussels Airport turns its link from `gekend` (counts half) to `actief`, and `travel-insurance` climbs from 0.37 to about 0.61. A tip can therefore enter the top 3 right after a connect, and it then arrives in the bar as a new finding.

### 4.10 Text section (proposal)

"Mijn wereld in tekst" (Q4):
- one group per **cluster**, with the backend's Dutch ecosystem name (Wonen, Mobiliteit, Reizen, …), in the backend's order (strongest first)
- one row per link: Dutch label · partner or "KBC" · status chip:

  | Status | Chip | Tone |
  |---|---|---|
  | `actief` | "actief" | ok |
  | `gekend` | "koppelen" | info |
  | `mogelijk` | "tip" | warn |

  The tones are the phase-1 `chipTones`.
- a row opens the same sheet as its place, plot or tip
- links close the section: "Op jouw maat" (consents, `PUT K/toestemming`), "Gekoppelde partners" (every partner with sharing on, to stop sharing), "Account" (the phase-1 `AccountSheet`), "Uitloggen"

This list is also the accessible version of the world. It's reachable with a screen reader in reading order.

### 4.11 Sheets and the connect flow

All sheets use the phase-1 `BottomSheet`.

**Overlays.** The sheets and the Kate chat share one veil (`components/Overlay.tsx`), owned by the screen. A tap on it closes the overlay on top; Escape and Android back do the same.
- **Vraag Kate in a sheet**: the chat rises over the sheet (380ms, `cubic-bezier(.16,1,.3,1)`, no overshoot: on a full-height panel an overshoot opens a gap at the bottom). The sheet holds still and takes no input meanwhile; once the chat covers it, the sheet closes unseen. Closing the chat before it has finished opening returns to the sheet.
- The bottom sheet keeps the phase-1 overshoot; its panel reaches 48px below the screen edge, so the overshoot never shows a gap.
- The closed chat panel leaves the layout (`display: none`) instead of fading to opacity 0, which made the browser present stale frames of its iframe now and then.
- Focus (web) moves into a panel when it opens and goes back to what opened it when it closes; a chat opened from a sheet that has since closed gives focus back to the place the sheet came from. `aria-hidden` is set only after a panel has finished closing, so it never lands on a focused element.

**Linked place sheet** (`PlaceSheet`)
- Contents:
  - title: the category label, plus the brand when the place is a partner's
  - every `actief` link: label, "sinds {sinds}" for partners, origin for partners ("via KBC Mobile" / "via je rekening" / "door jou gekoppeld")
  - shields
  - `gekend` attachments, each with a **Koppel** button
  - tips for the place, with **Vraag Kate**
- Each sharing partner has a **Stop delen** button: `PUT K/partners/:partner {deelt: false}`.
- For `household` with a confirmed moment, also "Bekijk checklist" (opens the phase-1 `BirthChecklist`).

**Ghost sheet** (`ConnectSheet`)
- Title "Koppel {naam}" for a known partner, or "Koppel je {label}" for an empty essential.
- For a known partner, one row:
  - text depends on `herkomst`:
    - REKENING: "KBC ziet betalingen aan {naam} op je rekening."
    - KBC_MOBILE: "Je gebruikt {naam} in KBC Mobile."
  - a **Koppel** button
- For an empty essential, one row per catalogue partner of that category, excluding `gevoelig` ones (for `shop`: Joyn).
- The consent line under the list: "{naam} deelt dan je gegevens met KBC. Je kan dit altijd stoppen."
- **Koppel** calls `PUT K/partners/:partner {deelt: true}` and goes through these states:
  - `idle`
  - `connecting`: spinner, label "Koppelen…"
  - `connected`: the sheet closes, the world refetches, the street scrolls to the place, ghost → linked (or the arrival) plays, an `arrived` finding appears
  - `failed`: inline text "Koppelen lukte niet. Probeer opnieuw." with the button back to idle

**Plot sheet** (`PlotSheet`)
- Title "{ecosystem naam}: hier kan je wereld groeien".
- The tips for that ecosystem, by score. Each tip shows its label, the "Waarom?" reasons, and **Vraag Kate**. A partner tip also gets **Koppel**, which creates the relation (`herkomst: KLANT`) and turns the plot into a place.

Keyboard and accessibility: every place, attachment and plot is a `role="button"` with `aria-label="{label} {brand}, {state}"`, focusable, with Enter/Space to open and the phase-1 focus ring (see `Hotspot.tsx`).

### 4.12 Trust & privacy

These carry over from phase 1 and match the backend's rules:

- **Consent decides what exists.**
  - A `REKENING`-origin relation only exists with `REKENING` consent.
  - A `KBC_MOBILE` one only exists with `APP` consent.
  - The backend enforces this; the app draws what it returns. Switching a consent off makes those ghosts disappear on the next poll.
- **Health stays out of the world.**
  - The `gevoelig` partners (`helena`, `leadlife`, `kom-op-tegen-kanker`) never become a place, an attachment, a finding or a label, even if the backend returns them.
  - Health insurance shows only as a shield.
- **Kate narrates and explains.** A product proposal always waits for the customer's confirmation.
- **A `suggest` finding names its reasons** and always offers "Niet nu". It leads to information and a conversation; buying a product is a separate, explicit step.
- **Sharing is reversible.** Connecting a partner always shows what is shared and how to stop. Stopping is one tap in the place sheet or under "Gekoppelde partners".
- **Only the customer connects.** `PUT K/partners` requires the `klant` role. The backoffice can read the world but never connect for the customer.

### 4.13 Copy and style

- UI copy is **Dutch**, in the KBC Mobile tone. Code, comments and docs are **English**. Backend field names stay Dutch in the API types.
- Tokens come from `src/features/mijn-wereld/theme.ts`: the `world` palette, `chipTones`, `shadow`, Fredoka for display, Nunito for body.
- The phase-1 spec `developer-prompt-mijn-wereld.md` stays the reference for visual style (cards, pills, shadows). Its island layout, state machine and tiles are superseded by this plan.

## 5. Architecture

### 5.1 Phase-1 inventory

| Path (under `src/`) | Fate | Notes |
|---|---|---|
| `app/_layout.tsx`, `app/login.tsx` | keep | Auth guard, fonts |
| `app/index.tsx` | change | Wraps the screen in both providers (moment + world) |
| `features/auth/*` | keep | Session, login, showcase bridge |
| `features/kate-chat/*` | change | Opened from the Kate bar and the finding cards; `KateChat` gains the `opener` prop (4.9) |
| `features/mijn-wereld/MijnWereldScreen.tsx` | rewrite | Four-band page (4.1) |
| `components/Header.tsx`, `KateCoinBadge.tsx`, `KateLogoIcon.tsx`, `TabBar.tsx`, `BottomSheet.tsx`, `PhoneFrame.tsx`, `ui.tsx` | keep | Header becomes an absolute overlay on the world band |
| `components/KateCard.tsx` | change | Its visuals become the finding cards in `KateFindings`; its phase content becomes the `moment` finding |
| `components/SheetContent.tsx` | change | `DomainSheet` → `PlaceSheet`; `WhySheet` and `AccountSheet` stay |
| `components/BirthChecklist.tsx` | keep | Opened from the household sheet |
| `components/DomainTiles.tsx`, `SkyBackground.tsx` | retire | Delete once the new screen is in (M1/M2) |
| `components/IslandScene.tsx`, `island.module.css`, `scene/Eiland.tsx` | retire | Keep until `Street` replaces it in M2 |
| `components/scene/Huis.tsx`, `Auto.tsx`, `Gezin.tsx`, `Windmolen.tsx`, `Boom.tsx` | move | Into `world/avatars/*` (house, car, household, energy, coin-tree), re-based to local coordinates |
| `components/scene/Defs.tsx`, `font.ts` | move | Into `world/scene/`, shared by every avatar |
| `components/scene/KateLogo.tsx` | retire | The orb gives way to the Kate bar (D14), which uses the native `KateLogoIcon` |
| `components/scene/Hotspot.tsx` | change | Pattern for `world/Place.tsx` |
| `state/*` | keep | The moment store (phase, checklist, STP) stays as is |
| `services/kbcApi.ts` | change | Add the ecosystem types and calls from 6.2 |
| `services/http.ts`, `momentService.ts`, `actionService.ts` | keep | `worldService.ts` is added beside them |
| `mocks/tomEnLien.ts`, `mockServer.ts` | keep | World mocks go in `mocks/world/` |
| `theme.ts` | keep | Brand colours go in `world/partners.ts`, not here |

### 5.2 Target files

```
src/features/mijn-wereld/
  MijnWereldScreen.tsx        four-band page; owns sheet state and the Street ref
  components/
    KateBar.tsx               the Kate bar: look, rotation, new-finding animation; fixed above the tab bar (4.9)
    KateFindings.tsx          finding cards (reuses KateCard visuals)
    WorldText.tsx             text section (4.10)
    PlaceSheet.tsx            linked place sheet (+ Stop delen)
    ConnectSheet.tsx          ghost sheet + Koppel flow
    PlotSheet.tsx             plot sheet with tips
  services/
    kbcApi.ts                 + catalogus, ecosystemen, partners, setDeling (6.2)
    worldService.ts           getCatalogus() (cached), getWorld(), setDeling(); API or mock
  mocks/
    world/                    recorded backend responses (6.1) + a tiny mock engine for deelt
  world/
    types.ts                  CategoryId, ZoneId, Place, WorldView, Finding
    categories.ts             THE mapping: partners, ecosystems, products → categories, zones, shields (4.4)
    labels.ts                 Dutch product names, second-person "via" phrases, category labels
    partners.ts               brand colours per partner id
    layout.ts                 world height, ground line, layer y-ranges, widths, spacing, parallax
    buildWorld.ts             (catalogus, ecosystemen, partners, klant, moment) → WorldView (pure)
    state/
      store.tsx               WorldProvider: load, poll, setDeling, seen-set
      reducer.ts              world actions
      selectors.ts            selectFindings, selectZones, selectTextRows
      useKateTicker.ts        rotation index + new-finding queue, shared by both Kate bar copies
    Street.tsx                'use dom': sky, layers, places, plots, camera, fly-in, overlays
    street.module.css         fly-in keyframes, ghost class, arrival, idle loops
    Place.tsx                 place wrapper: hotspot, linked/ghost/plot, shields, attachments, Kate flag, arrival
    scene/                    shared defs (gradients, filters), clouds, road, sea, hills, plot, Kate flag, shield
    avatars/
      index.ts                registry: category → { Avatar, meta }
      house/      House.tsx  meta.ts
      fuel-station/ FuelStation.tsx  meta.ts
      …           one folder per category in 4.4
      placeholder/Placeholder.tsx   labelled block for categories without art yet
```

**Avatar contract**

```ts
// world/avatars/<category>/meta.ts
export const meta = { label: 'Tankstation', zone: 'town', width: 150 } satisfies AvatarMeta;

// world/avatars/<category>/<Name>.tsx — plain SVG elements, local coordinates:
// x = 0 at the left edge, base on GROUND_Y from layout.ts.
export function FuelStation({ brands, attachments }: AvatarProps) { … }
```

Adding a category takes three steps: create the folder, add a line in `avatars/index.ts`, and add the mapping in `categories.ts`. A category without art yet uses `placeholder`, so the data pipeline works before the drawing exists.

**As built (2026-10-20)**, where it differs from the tree above:
- No `meta.ts` per avatar: label, zone and width are in `categories.ts` (D25). `avatars/index.ts` gives each avatar its `top`, Kate-flag anchor and attachment placement.
- `PlaceSheet`, `ConnectSheet`, `PlotSheet`, `ConsentSheet` ("Op jouw maat") and `PartnersSheet` ("Gekoppelde partners") share one file, `components/WorldSheets.tsx`.
- `scene/` holds `Defs.tsx`, `font.ts`, `Backdrop.tsx` (clouds, hills, skyline, road, sea, island land, boat, bus, trees, waves, plane), `Badges.tsx` (signs, shields, Kate flag, sparkles) and `Plot.tsx`.
- `kate-chat/types.ts` holds `ChatOpener`; `ChatView` exposes `post()` for the `kate:opener` message.

### 5.3 Types (sketch)

**Backend types** live in `services/kbcApi.ts`. They mirror `../backend/src/ecosysteem.ts`, `catalogus.ts` and `routes/ecosystemen.ts`, with field names as in the API:

```ts
export type EcosysteemId =
  | 'WONEN' | 'MOBILITEIT' | 'PENSIOEN' | 'BELEGGEN' | 'SPAREN' | 'ONDERNEMEN' | 'REIZEN' | 'ENERGIE'
  | 'DAGELIJKS_BANKIEREN' | 'GEZIN' | 'GEZONDHEID' | 'VERMOGEN' | 'WERK' | 'INTERNATIONAAL'
  | 'BESCHERMING_ONDERNEMING' | 'LANDBOUW' | 'ADMINISTRATIE' | 'WINKELEN' | 'DIGITAAL' | 'VEILIGHEID' | 'INTEGRATIES';
export type LinkStatus = 'actief' | 'gekend' | 'mogelijk';
export type Herkomst = 'REKENING' | 'KBC_MOBILE' | 'KLANT';
export type NodeId = `product:${string}` | `partner:${string}`;

export interface Waarom { via: NodeId | `moment:${string}`; naam: string; reden: string }
export interface Link {
  id: NodeId; soort: 'product' | 'partner'; ref: string; naam: string; ecosysteem: EcosysteemId;
  status: LinkStatus; herkomst?: Herkomst | 'KBC_PRODUCT'; sinds?: string;
  score?: number; waarom?: Waarom[];          // mogelijk only
}
export interface Cluster { ecosysteem: EcosysteemId; naam: string; status: LinkStatus; links: Link[] }
export interface EcosystemenResponse {
  week: number;
  samenvatting: { actief: number; gekend: number; mogelijk: number; ecosystemen: number; nieuweEcosystemen: EcosysteemId[] };
  clusters: Cluster[];
  verbanden: { van: string; naar: NodeId; gewicht: number }[];
}
export interface KlantPartner {
  partner: string; naam: string; ecosysteem: EcosysteemId; gevoelig: boolean;
  klantBijPartner: boolean; deelt: boolean; herkomst: Herkomst | null; sinds: string | null;
}
export interface CatalogusResponse {
  ecosystemen: { id: EcosysteemId; naam: string; aantalProducten: number; partners: string[] }[];
  producten: { id: string; naam: string; ecosysteem: EcosysteemId; partners: string[]; kanaal: 'KLANT' | 'B2B' }[];
  partners: { id: string; naam: string; ecosysteem: EcosysteemId; ecosystemen: EcosysteemId[]; producten: string[]; gevoelig: boolean }[];
}
```

**World types** live in `world/types.ts`. They're the only shapes the UI knows:

```ts
export type CategoryId =
  | 'house' | 'household' | 'energy' | 'coin-tree' | 'bench' | 'car'
  | 'bank' | 'shop' | 'car-share' | 'bike-station' | 'bus-stop' | 'telecom-shop' | 'newsstand'
  | 'estate-agency' | 'post-office' | 'watchtower'
  | 'fuel-station' | 'train-station' | 'metro' | 'parking' | 'stock-exchange' | 'business' | 'farm'
  | 'airport' | 'island';
export type ZoneId = 'home' | 'neighbourhood' | 'town' | 'away';

export interface Brand { partnerId: string; name: string; colors: { primary: string; secondary?: string; text: string } }

export interface Place {
  id: CategoryId;             // one place per category per world
  zone: ZoneId;
  state: 'linked' | 'ghost' | 'plot';
  isNew: boolean;             // plays the arrival once
  ecosystems: EcosysteemId[];
  links: Link[];              // actief + gekend links drawn here
  brands: (Brand & { state: 'linked' | 'ghost' })[];       // partners on this place's own sign(s)
  attachments: (Brand & { state: 'linked' | 'ghost' })[];  // partners drawn as details
  shields: string[];          // insurance product ids
  tips: Link[];               // mogelijk links that land here, by score
}

export interface Household { adults: 1 | 2; children: number; names: string[]; pendingBaby: boolean }

/** Everything the Street needs. JSON-serializable: it crosses the DOM-component bridge. */
export interface WorldView { household: Household; places: Place[] }

export interface Finding {
  id: string;
  kind: 'moment' | 'suggest' | 'connect' | 'arrived' | 'all-good';
  placeId?: CategoryId;
  link?: Link;
  teaser?: string;            // Kate bar, ≤ 70 chars
  text: string;               // finding card
  opener?: string;            // Kate's first chat message
  isNew: boolean;             // jumps to the front of the Kate bar once
  actions: { label: string; command: 'ask-kate' | 'view' | 'connect' | 'confirm' | 'reject' | 'why' | 'dismiss' }[];
}
```

### 5.4 State and data flow

```
GET /v1/catalogus (once, cached) ──┐
GET K/ecosystemen (poll) ──────────┤
GET K/partners    (poll) ──────────┼─▶ worldService ─▶ buildWorld() ─▶ WorldView ─▶ WorldProvider ──┬─▶ Street (DOM)
GET K             (profile, once) ─┘     API or mock     categories.ts               + seen-set        ├─▶ selectFindings ──┬─▶ KateBar ──tap──▶ KateChat (opener)
                                                         labels.ts                   (AsyncStorage)    │                    └─▶ KateFindings
moment store (phase 1) ──────────────────────────────────────────────────────────────────────────────┘                                     └─▶ WorldText
PUT K/partners/:partner {deelt} ◀── ConnectSheet / PlaceSheet / PlotSheet / finding buttons ── then refetch
```

- **The UI only knows `WorldView` and `Finding`.** Backend shapes stop at `worldService` and `buildWorld()`, the same rule as phase 1.
- **`buildWorld` is pure and deterministic.** The same responses always give the same world, which keeps the layout stable (4.3) and makes it testable against the Tom table in 4.4.
- **Polling**: `WorldProvider` refetches `K/ecosystemen` and `K/partners` every 1.5s while the screen is focused, reusing the phase-1 `TIMING.momentPoll`. The backend logs repeated reads once per minute and allows 1200 requests/min in demo mode.
- **After a PUT**: refetch immediately rather than waiting for the next poll, so the transition starts within a second.
- **Seen-set (D9)**: the `AsyncStorage` key `mijn-wereld:seen:{klantId}` holds `linkId:status` strings for `actief` and `gekend` links.
  - On load, if the key is missing (first launch), store all current entries and mark nothing new.
  - Otherwise, a place with an unseen entry gets `isNew: true`. A link going from `gekend` to `actief` is a state transition, not an arrival.
  - When the Street reports `onArrivalsDone(ids)`, add their entries to the set.
- **Reducer actions**: `WORLD_LOADED`, `WORLD_UPDATED`, `LOAD_FAILED`, `DELING_START`, `DELING_DONE`, `DELING_FAILED`, `ARRIVALS_SEEN`, `FINDING_DISMISSED`.

### 5.5 Native ↔ DOM boundary

`Street.tsx` is a DOM component. Its props must be JSON-serializable; function props become async native actions.

**Props in**
- `world: WorldView`
- `flyInKey: number`: bumped on focus; a change restarts the fly-in
- `reducedMotion: boolean`: from `AccessibilityInfo` on native; the DOM side also checks the media query
- `dom`: `{ scrollEnabled: false, style: { width, height } }`: the page scroll stays native, and horizontal scrolling happens in a DOM `overflow-x: auto` container inside

**Actions out**
- `onSelectPlace(id)`
- `onSelectAttachment(placeId, partnerId)`
- `onFlyInDone()`
- `onArrivalsDone(ids)`
- `onZoneChange(zone)`

**Imperative handle**, via `useDOMImperativeHandle` from `expo/dom`:
- `scrollToPlace(id)`: used by findings, the text section and the connect flow
- `scrollToZone(zone)`
- `skipFlyIn()`

**Header overlay**: the native `Header` sits absolutely positioned over the top of the world band, with `pointerEvents="box-none"` so the sky stays tappable.

## 6. Data & API

### 6.1 Personas and mock data

| Persona | Login | Customer | What the backend gives (commit `cc209bb`) |
|---|---|---|---|
| **Tom & Lien** | `tom` / `lien` (shared customer) | `K-2024-0417` | Products: zichtrekening, spaarrekening, huurwaarborg, woonverzekering, autolening (elektrisch), autoverzekering, hospitalisatie, familiale. Partners: Immoscoop, VAB, NMBS, Joyn (sharing); Cambio, Brussels Airport (seen on the account); De Immowinkel (seen in KBC Mobile). Moments on the demo clock: GEZINSUITBREIDING, HUIS_KOPEN, TROUWEN. The expected world is the table in 4.4 |
| **Jonas** (entrepreneur) | `jonas` | `K-2022-0311` | Founder of Stroomvaart BV (emission-free inland shipping, 6 employees). Business account, investment and energy loans, business insurances, VAPZ. Partners: Billit, Encon, Kube (sharing); Sweco, NOWJOBS, Go Solid, MoveSmart, Firsty (seen on the account). Moment on the demo clock: ZAAK_UITBREIDEN. No geofencing consent. The expected world is in 4.4 |

Sarah is gone: Jonas replaced her in the backend (`cc209bb`).

Jonas's world, as a proposal, centres on the `business` place: his company, with Billit and his other ONDERNEMEN partners as attachments, `BESCHERMING_ONDERNEMING` shields, and ONDERNEMEN tips. His demo-clock moment is `ZAAK_UITBREIDEN`; drawing it as a world event, the way `GEZINSUITBREIDING` is Tom & Lien's, isn't built yet.

**Mock mode** (`EXPO_PUBLIC_SIGNALS_SOURCE=mock`, offline):
- `mocks/world/` holds responses recorded from the running backend (`cc209bb`, 2026-10-20): `catalogus.json`, and `GET K`, `GET K/ecosystemen` and `GET K/partners` for Tom (`tom.json`) and Jonas (`jonas.json`). The mock serves Jonas when the session user is `jonas`, else Tom.
- A tiny mock handles `PUT deelt`:
  - flips the partner's status between `gekend` and `actief`
  - creates a `herkomst: KLANT` link for a new partner
- Consent works as in the backend: a relation from a source without consent disappears.
- It doesn't re-run the suggestion rules; tips stay as recorded.
- `EXPO_PUBLIC_MOCK_TIMELINE=1` connects De Lijn after 25s (a `KLANT` relation), for an offline arrival demo.

### 6.2 API used by the app

All calls go through `kbcRequest` in `services/kbcApi.ts` (the token from the phase-1 session; on web via the `/v1` dev proxy). Here `K` = `/v1/klanten/:klantId`, and `klantId` comes from the session.

| Call | Role | Used for | When |
|---|---|---|---|
| `GET /v1/catalogus` | klant | Partner names, `gevoelig` flags, product → ecosystem/partner, `kanaal` | Once per session, cached in memory |
| `GET K` | klant | `naam` (household), `toestemming` (Op jouw maat) | On load |
| `GET K/ecosystemen` | klant | Clusters and links: places, states, tips, plots, `samenvatting.nieuweEcosystemen` | On load, every 1.5s while focused, right after every PUT |
| `GET K/partners` | klant | `herkomst` and `sinds` for sheets; the partner list for empty essentials | Same as `K/ecosystemen` |
| `PUT K/partners/:partner` `{deelt: boolean}` | klant only | Koppel / Stop delen | On tap |
| `PUT K/toestemming` | klant only | "Op jouw maat" switches in the text section | On tap |
| `GET K/momenten`, `POST …/bevestig`, `DELETE …` | klant | Phase-1 family moment, unchanged | As in phase 1 |

**Errors** follow the backend's `{ error }` shape:

| Error | What the app does |
|---|---|
| `401` | Back to login (phase 1) |
| `404` | Treated as "not found" |
| `422 gevoelige_partner` | Shouldn't happen, because sensitive partners are never offered. If it does, the sheet shows the generic failure |
| `429` | Polling backs off to 5s for a minute |

**Not used by the app**:
- `verbanden`: the reasoning edges, intended for the backoffice graph
- `GET /v1/ecosystemen/:id`, `GET /v1/partners`: covered by `/catalogus`
- the demo endpoints: adviseur-only

**Gaps for the world**, all in Q1–Q9:
- household composition
- Engie, restaurant, cinema and hotel partners
- Dutch product names
- the employer for `workplace`
- a demo endpoint that gives a customer a new product or relation from the backoffice
- Jonas

## 7. Build plan

**Status 2026-10-20:** M0–M6 are built. They were verified on web against a local `../backend` at `cc209bb` (headless Chrome, in the phone frame and at 390px): the fly-in, the street, connect (Cambio), growth (Blue-bike), the Brussels Airport transition with the travel-insurance tip, consent off and on, a backend reset, the family moment, the chat opener (URL and message), Jonas, mock mode and reduced motion. **Not yet verified on the iOS simulator or an Android device** (R1, R2). M7 is partly done; see there.

Milestones in order:
- M0 → M1 → M2 are sequential.
- After M2, M3–M7 touch different files and can run in parallel.
- M8 picks up the backend gaps as the colleague closes them.
- M9 closes.

Every milestone ends with `npx expo lint` and `npx tsc --noEmit` clean (see `AGENTS.md`).

### M0 · Foundations (data before pixels)
- [x] Backend types and calls in `services/kbcApi.ts` (6.2, 5.3)
- [x] `world/types.ts` (5.3)
- [x] `world/categories.ts`: every partner, ecosystem and shield product from 4.4; skip rules for `gevoelig`, `B2B`, `DIGITAAL`, `INTEGRATIES`
- [x] `world/labels.ts`: Dutch labels and "via" phrases for at least everything in Tom's world and tips
- [x] `world/partners.ts`: colours for every partner with signage in Tom's world
- [x] `world/layout.ts`: the numbers from 4.2 and 4.3, and `layoutWorld(places) → positioned places + total width`
- [x] `world/buildWorld.ts` with the state rules of 4.4
- [x] `services/worldService.ts` (API + mock) and `mocks/world/` recorded from the running backend

**Done when** `buildWorld` on Tom's recorded responses yields exactly the Tom table in 4.4, a `gevoelig` partner injected into the data yields nothing, and typecheck passes.

### M1 · Page layout
- [x] Rewrite `MijnWereldScreen.tsx` into the four bands of 4.1 (world band height formula, Header overlay, a static Kate bar that opens the plain chat, finding-card and text placeholders)
- [x] ~~Temporarily render the phase-1 `IslandScene` in the world band~~ skipped: went straight to the Street
- [x] Remove `DomainTiles` and `SkyBackground` from the screen (`SkyBackground` stays for the login screen)

**Done when**, on web at 390×812 and on the iOS simulator:
- the world band fills the first view down to the Kate bar (changed from ≥ 80%, D6)
- the Kate bar is fixed right above the tab bar
- the page scrolls vertically to the text section

### M2 · Static street
- [x] `Street.tsx` DOM component: sky, cloud and back layers, road, sea, places and plots laid out from `WorldView`, horizontal scroll container, parallax, zone strip
- [x] `Place.tsx` wrapper: hotspot, focus, aria-label, shields, attachments slot, Kate flag
- [x] Move and re-base `Huis` → `house`, `Gezin` → `household`, `Auto` → `car`, `Windmolen` → `energy`, `Boom` → `coin-tree`; move `Defs` and `font` to `world/scene/`
- [x] `placeholder` avatar for every other category, and the shared plot avatar
- [x] Swap `IslandScene` out of the screen and retire it

**Done when**:
- Tom's world from the **live backend** renders every place and plot of the 4.4 table (placeholders allowed)
- it scrolls horizontally on web, iOS and an Android device without fighting the vertical page scroll (see R1)
- tapping a place calls `onSelectPlace` with its id

### M3 · Ghosts, plots, sheets, connect
- [x] Ghost CSS class, plot avatar, Kate flag (4.6) and the ghost ↔ linked transitions (4.8)
- [x] `PlaceSheet` (with Stop delen), `ConnectSheet`, `PlotSheet` (4.11), wired from `onSelectPlace` / `onSelectAttachment`
- [x] `setDeling` through `worldService` (`PUT K/partners/:partner`), reducer actions, immediate refetch
- [x] Household sheet: "Bekijk checklist" opens `BirthChecklist` when the moment is confirmed

**Done when**, against the live backend as Tom:
- tapping the dotted Cambio car-share → Koppel turns it linked with the transition
- Stop delen turns it back into a ghost (Cambio's origin is REKENING)
- the VAB attachment connects the same way
- a forced failure shows the inline error
- `POST /v1/demo/reset` (as `adviseur`) brings everything back

### M4 · Growth and arrivals
- [x] Polling in `WorldProvider` (focused only, back-off on 429)
- [x] Seen-set in AsyncStorage (5.4) and `isNew`
- [x] Arrival queue in `Street` (4.8): scroll, plot → place, grow, sparkles, layout shift, `onArrivalsDone`
- [x] Mock timeline (6.1) for offline demos

**Done when**:
- as Tom, connecting the **Blue-bike tip** from the car's sheet makes a bike station rise in the neighbourhood with its arrival
- connecting Brussels Airport turns the island, airport and plane solid
- switching the `REKENING` consent off removes Cambio, VAB and Brussels Airport on the next poll
- reloading the app replays no arrival

### M5 · Fly-in
- [x] Camera group and keyframes (4.7) in `street.module.css`
- [x] Clouds as the loading state; continue when data is in
- [x] `flyInKey` bumped from `useFocusEffect` (expo-router) in the screen
- [x] Tap to skip, locks during the fly-in, `onFlyInDone`
- [x] Reduced-motion fade

**Done when**:
- every screen open (mount, login, focus) plays the fly-in and lands on the household
- arrivals wait for it
- a tap skips it
- with reduced motion on (OS setting), the world only fades in

### M6 · Kate bar, findings and text section
- [x] `selectFindings` (4.9): every kind with teaser, text and opener, built from links, scores and `waarom`; the D21 limits
- [x] `KateBar.tsx` + `useKateTicker.ts`: chat-input look, rotation, new-finding animation, idle shimmer, pauses, reduced motion, accessibility
- [x] ~~Sticky dock: track the in-flow bar's position on scroll; slide the docked copy in and out above the tab bar; bottom padding~~ replaced by one bar fixed above the tab bar (D17, 2026-10-20)
- [x] `KateChat` `opener` prop: URL parameter on first open, `postMessage` on later opens, plain chat as fallback
- [x] Chat-page change (read `opener`, listen for `kate:opener`) made in `poc-runner/chat` (D24); it still needs a commit and a redeploy of the chat container
- [x] `KateFindings.tsx` cards with actions wired to `scrollToPlace`, the sheets, `setDeling` and the chat opener
- [x] `WorldText.tsx` (4.10) with the consent switches

**Done when**:
- the Kate bar rotates Tom's top tips (energy loan, renovation loan, …) and his `connect` findings (Cambio, VAB, Brussels Airport)
- after connecting Brussels Airport, the travel-insurance tip enters the bar as a new finding with the pulse, lift and typing
- tapping the bar opens the chat. With the chat change in place, Kate starts with the finding; without it, the chat opens plain and nothing errors
- scrolling past the bar docks it above the tab bar; scrolling back undocks it, and the teaser doesn't jump
- each card button scrolls to the right place, opens the right sheet, connects, or opens the chat with the right opener
- the moment question still confirms and rejects as in phase 1

### M7 · Avatars and brands
Draw the remaining avatars, Tom's world first:
1. `fuel-station` (Q8)
2. `train-station` (NMBS)
3. `bank` (KBC)
4. `shop` (Joyn)
5. `car-share` (Cambio)
6. `airport` + plane (Brussels Airport)
7. `island`
8. attachments: Setle, VAB
9. `bike-station`
10. `bench`
11. `bus-stop` (De Lijn)
12. `business` (for Jonas)
13. the rest of 4.4

Done on 2026-10-20: `bank`, `car-share`, `bike-station`, `airport` + plane, `island`, signposts for attachments and stickers on the car, plus the re-based phase-1 `house`, `household`, `car`, `energy` and `coin-tree`. In a second round the same day (D26–D28): `shop`, `estate-agency` (a Flemish stepped gable), `train-station` (clock tower, the train pulling in), `stock-exchange` (ticker board, bull), `business` and `bench`; arms, a wave and blinking for the household; smoke, a flower box and a hedge for the house; charging for the car; glints for the coin tree; windows and lanterns for the bank; seedlings on plots. Still placeholders (a building in the brand's colours with its sign): `fuel-station`, `bus-stop`, `telecom-shop`, `newsstand`, `post-office`, `watchtower`, `metro`, `parking` and `farm`, none of which Tom or Jonas has. All idle loops in 4.8 run.

- [ ] Add each one's idle animation from 4.8

**Done when** no placeholder is visible anywhere in the demo script (section 10), and each avatar holds up at the fly-in close-up (scale 1.8).

### M8 · Backend gaps (as the colleague closes them)
- [ ] Household composition → replace the `naam` split (Q1)
- [ ] New partners (Engie, restaurant, cinema, hotel, employer) → add them to `categories.ts`, `partners.ts` and avatars; lift D22 (Q2)
- [ ] Dutch product names from the backend, if provided → slim down `labels.ts` (Q5)
- [x] Jonas seeded → record his mock, add his expected world to 4.4 and his test to M0 (Q7)
- [ ] Demo endpoint for new products or relations → wire the backoffice-driven arrival into the demo (Q9)

**Done when** each item's data shows in the world without changes outside `worldService`, `buildWorld`, `categories.ts`, `labels.ts` and `partners.ts`.

### M9 · Polish and demo hardening
- [ ] Device run on iOS and Android: frame rate during the fly-in and scrolling (R2)
- [ ] Accessibility pass: labels, focus order, text section with a screen reader
- [ ] Copy pass on all Dutch strings (je/jullie, labels, via phrases)
- [ ] Demo reset path: `POST /v1/demo/reset` (adviseur) restores the backend; logout clears the seen-set

**Done when** the demo script runs end to end three times in a row on a device without errors.

## 8. Verification

At the end of each milestone, check against the milestone's "Done when" and run:

| Check | How |
|---|---|
| Lint and types | `npx expo lint`, `npx tsc --noEmit` |
| World mapping | `buildWorld` on the recorded Tom responses matches the 4.4 table |
| Web, phone frame | `npx expo start --web`, a wide window (phone frame) and 390px wide |
| iOS | iOS simulator through `npx expo start` |
| Android | A physical device: gestures and webview performance differ most there |
| Backend mode | `.env.local` per `.env.example` (`KBC_API_TARGET`, `KBC_GATE_PASSWORD`), or a local `../backend` (`pnpm dev`) with `KBC_API_TARGET=http://127.0.0.1:3000`. The dev proxy only uses the site gate for `api.` hosts, so a local target works with `KBC_GATE_PASSWORD` still set. Don't start Expo with `CI=1` while editing: Metro then stops watching files |
| Mock mode | `EXPO_PUBLIC_SIGNALS_SOURCE=mock` in `.env.local` (`EXPO_PUBLIC_MOCK_TIMELINE=1` adds the offline arrival) |
| Backend reset | `POST /v1/demo/reset` as `adviseur` between test runs |
| Consent | Switch `REKENING` off in the text section: the REKENING-origin ghosts disappear |
| Reduced motion | OS accessibility setting; in browser devtools, emulate `prefers-reduced-motion` |
| Keyboard (web) | Tab through places, attachments and plots; Enter/Space opens; focus ring visible |
| Kate bar | Scroll down: the bar docks above the tab bar; scroll back: it returns under the world. With a screen reader on, rotation pauses and the bar reads its label |
| Console | No errors or warnings, apart from the dev-only unknown-id warning |

## 9. Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | The horizontal scroll inside the DOM webview fights the native vertical page scroll, especially on Android | Test on an Android device in M2. Options, in order: tune the webview's nested scrolling (check which props `@expo/dom-webview` supports in SDK 57); put the street in a native horizontal `ScrollView` around a non-scrolling, full-width DOM component (`matchContents`); as a last resort, port the street to `react-native-svg`. Raise it with the user before restructuring |
| R2 | A wide SVG with filters stutters in the webview on Android during the fly-in | Animate only the camera group and the cloud overlay, keep `will-change: transform` on them, avoid animated elements with filters, and use pre-softened shapes for shadows |
| R3 | The backend catalogue or rules change (new partner ids, renamed products) | Unknown ids produce no place and a dev warning instead of a crash; the mapping lives in one file. Re-run the M0 check after every backend pull |
| R4 | Brand use in a public demo | Drawn signage with names and colours, no logo files (D11) |
| R5 | Too many arrivals at once make the demo slow | The queue plays at most 3 arrivals with full animation; the rest appear together with one sparkle burst |
| R6 | The fly-in every time becomes tiring in daily use | It's skippable with a tap. For the demo it plays every time (D7); revisit after the hackathon |
| R7 | The chat opener needs a change in `poc-runner/chat`, outside this repo | The plain chat is the fallback, so the bar works without it. Agree the contract (URL `opener` + `kate:opener` message) early (Q8) |
| R8 | A constantly moving bar competes with the world for attention | Rotation every 6s, pauses on interaction, the chat and screen readers, and a calmer reduced-motion mode. The loud animation is kept for genuinely new findings |
| R9 | English product names leak into the Dutch UI | `labels.ts` covers everything in the demo path; the copy pass in M9 checks it; Q5 asks the backend for Dutch names |
| R10 | Tips feel like hard selling | D21 limits, every tip names its reason, "Niet nu" everywhere, and buying is never one tap (4.12) |
| R11 | Without a backend way to add products live, the "world grows" moment depends on the customer connecting | The demo uses connect, consent and moment confirmation, which are all live. Q9 asks for a demo endpoint; the mock timeline covers offline demos |

## 10. Demo script

Reset the backend first (`POST /v1/demo/reset` as `adviseur`).

1. **Open as Tom.** The fly-in drops through the clouds, circles home and lands on Tom & Lien. The street:
   - home: the house with a KBC shield and a dotted De Immowinkel sign, Tom & Lien with their shields, plots with Kate signs for Energie and Pensioen, the coin tree, the car with a shield and its VAB sticker
   - neighbourhood: the KBC bank, the Joyn shop, dotted Cambio cars, Immoscoop
   - town: the NMBS station and a Beleggen plot
   - away: across the sea, a dotted Brussels Airport with a dotted plane, and a dotted island
2. **Kate.** Under the world the Kate bar rotates: "Jullie huren. Jullie woonbudget eens berekenen?", "Jullie bankieren bij KBC. Interesse in een pensioenspaarfonds?", "Jullie reizen met de trein. Blue-bike eens proberen?", then the connect findings (De Immowinkel, Cambio, Brussels Airport). Tap the bar: the chat opens and Kate starts with that finding.
3. **Connect.** Tap the dotted Cambio cars, then Koppel. They fill in with their brand, and the bar pulses: "Nieuw in jullie wereld: Cambio."
4. **Grow.** Open the car and tap Koppel on the Blue-bike tip. A bike station rises in the neighbourhood.
5. **Travel.** Tap the dotted island and connect Brussels Airport. The airport, the island and the plane turn solid. The Kate bar pulses with "Nieuw in jullie wereld: Brussels Airport.", then with a new tip: "Jullie vlogen via Brussels Airport. Interesse in een reisverzekering?" Its score jumped from 0.46 to 0.66 because the link is now active.
6. **Trust** (optional). In "Mijn wereld in tekst", open "Op jouw maat" and switch off "Betalingen op je rekening". Cambio and Brussels Airport disappear, and Reizen becomes a plot.
7. **Family** (optional). Advance the backend demo clock to week 10: the dashed baby appears and Kate asks. Confirm: the baby joins Tom & Lien, the checklist card appears, and new family tips follow (sparen voor iemand anders, levensverzekering).
8. **Contrast.** Log in as `jonas`. His world centres on his own business in town, Stroomvaart BV, with Billit, Go Solid and NOWJOBS.

## 11. Open questions

Each one is blocked on the user (and often the backend colleague). When work reaches one, ask instead of choosing.

| # | Question | Blocks |
|---|---|---|
| Q1 | Can the backend return the household (adults, children)? Until then the app splits `naam` | Household accuracy (M8) |
| Q2 | Partners missing from the catalogue: Engie for the windmill (the user asked for it), restaurant, cinema, hotel, and the customer's employer for a workplace. Does the colleague add them, or do those places stay out (D22)? | Engie signage, the restaurant essential, M8 |
| Q3 | Is a watchtower with a KBC shield the right picture for `VEILIGHEID` (online fraud insurance)? | M7 `watchtower` |
| Q4 | ~~Is the text section's content right?~~ **Accepted** with D13 on 2026-10-20 | — |
| Q5 | Product names in the catalogue are English. Does the backend add Dutch names, or does the app keep `labels.ts`? Meanwhile `labels.ts` covers every product the backend's rules can suggest (2026-10-20) | Copy (R9) |
| Q6 | What earns Kate Coins in phase 2 (e.g. connecting a partner)? | Connect reward |
| Q7 | ~~Who is Jonas?~~ **Answered by the backend (`cc209bb`):** login `jonas`, customer `K-2022-0311`, Stroomvaart BV, demo moment `ZAAK_UITBREIDEN` | — |
| Q8 | ~~Who changes `poc-runner/chat` for the opener?~~ **Done** in this round (D24); it needs a commit and a redeploy of the chat container on the VM | — |
| Q9 | Should the backend get a demo endpoint (adviseur) that gives a customer a new product or partner relation, so the backoffice can make the world grow live? | Backoffice-driven arrivals in the demo (R11) |
