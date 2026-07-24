# Official skills & plugins — backend (on-demand)

Reference list of official Claude Code skills/plugins worth fetching **on demand** for backend work on this template (Node.js Express-style + Nest.js).

## Fetch policy

- **Fetch on demand — don't vendor unused.** Do not copy these into the repo or `.claude/skills/`. Pull the skill/plugin only when a task actually needs it, use it for that task, and let it go.
- Prefer the repo's own authored skills (`add-endpoint`, `data-model`, `auth-guard`, `new-feature`, `pr-workflow`, `readme-sync`, `code-review`, `ticket`) first; reach for an official one only to cover a gap.
- These are upstream sources, not pinned dependencies — verify the path still exists before relying on it.

## Catalogue

| Skill / Plugin | Purpose | Source |
|---|---|---|
| `webapp-testing` | Drive and verify a running endpoint/app (Playwright-based) — use to confirm a new route behaves end-to-end after `add-endpoint`. | https://github.com/anthropics/skills |
| `security-guidance` (plugin) | Review changes for injection, secrets, and unsafe input handling — run before opening a PR that touches auth, DB queries, or env. | https://github.com/anthropics/claude-code/tree/main/plugins |

## When to fetch which

- **After `add-endpoint`** → fetch `webapp-testing` to exercise the live route, capture responses/logs, and confirm validation and error paths.
- **After `auth-guard` or `data-model`** → fetch `security-guidance` for an injection/secrets/RBAC review of the diff (raw SQL, token handling, leaked env).
- Anything not listed here: search the upstream catalogues above on demand rather than adding a standing dependency.
