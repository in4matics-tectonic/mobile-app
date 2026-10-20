# KBC Momentum – Mobile app ("Mijn wereld" in KBC Mobile)

The customer side of the KBC Momentum PoC. "Mijn wereld" draws everything a customer has at KBC as a little street: their home, car, savings and the partners they use, grouped by KBC ecosystem. Kate, the assistant, notices a life moment from signals the customer consented to, **asks first** ("Klopt dat?"), and only after a yes arranges what's needed. For Tom & Lien that's a birth checklist she can run with one tap. Opportunities an adviser sends from the back office show up as a Kate card the customer answers.

Part of the PoC: [backend](https://github.com/in4matics-tectonic/backend) (data, scores, phases), [backoffice](https://github.com/in4matics-tectonic/backoffice), [mcp](https://github.com/in4matics-tectonic/mcp), [poc-runner](https://github.com/in4matics-tectonic/poc-runner) (runs everything together, plus the Kate chat). Spec: [KBC Momentum – Technisch document](https://github.com/in4matics-tectonic/docs/wiki/KBC-Momentum-%E2%80%93-Technisch-document). Design decisions and the build plan: [project-info.md](project-info.md).

## Run it

Expo SDK 57, npm.

```bash
npm install
cp .env.example .env.local   # optional, see below
npx expo start               # press w for the web version
```

Log in as `tom` or `lien` (Tom & Lien, expecting a baby) or `jonas` (Stroomvaart BV). The demo password is `in4matics-must-win`, committed on purpose: it only protects mock data.

- **Data:** the app calls the backend's `/v1` API same-origin. In development a Metro middleware forwards it (`scripts/dev-api-proxy.js`): by default to the shared PoC VM (set `KBC_GATE_PASSWORD` for its site password), or to a local backend with `KBC_API_TARGET=http://127.0.0.1:3000`.
- **Offline:** `EXPO_PUBLIC_SIGNALS_SOURCE=mock` runs on recorded data in `src/features/mijn-wereld/mocks/`.
- **Everything together:** `poc-runner` builds the web export and shows it next to the back office and the chat.

Checks (there are no test suites): `npx expo lint` and `npx tsc --noEmit`.

## Where things are

| Path | What |
| --- | --- |
| `src/app/` | Routes: login and "Mijn wereld" |
| `src/features/mijn-wereld/world/` | The street: building the world from the backend's ecosystem clusters, places, avatars, Kate's findings |
| `src/features/mijn-wereld/state/` | The life moment and the birth checklist |
| `src/features/mijn-wereld/services/` | Backend client (`kbcApi.ts`), world and moment services |
| `src/features/kate-chat/` | Kate's chat, embedded from the poc-runner chat server |
| `src/features/auth/` | Login, session, and the bridge the showcase's tours use to drive the app |

Score, phase and suggestions are computed by the backend; the app only displays them. Sensitive signals never reach the app.

## Unfinished (PoC)

- The birth checklist and its one-tap actions are simulated on an in-app mock server (`mocks/mockServer.ts`); the backend has the playbook but no endpoint that executes actions.
- Kate Coins and the bonus are display only.
- The household (adults, baby) is derived from the customer's name and the moment; the backend has no household data yet.
- Kate's chat needs the poc-runner chat server (`chat.<domain>`), and free-text answers need an Anthropic API key there.
- The showcase runs the web build. iOS and Android work through Expo, but weren't part of the demo.
