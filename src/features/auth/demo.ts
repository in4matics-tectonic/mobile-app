/** Demo customers from the backend; Tom and Lien share one customer file. */
export const DEMO_USERS = ['tom', 'lien'];
// Shared PoC demo password; may be hardcoded in frontends (backend AGENTS.md, rule 1).
// Aikido: not a secret. It's the public password of the demo accounts, committed on purpose so the demo login
// fills itself in; it guards no real data. `gitleaks:allow` (on the line itself) marks it safe for Aikido's
// secret scanner, which runs Gitleaks.
export const DEMO_PASSWORD = 'in4matics-must-win'; // gitleaks:allow
