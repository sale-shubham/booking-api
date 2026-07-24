# CLAUDE.md — Project Intelligence Hub

This file is the single source of truth for Claude Code in this project.
It lists every README path that must be kept in sync with the actual code.
Whenever code, logic, or flow changes — update the relevant README(s) listed below **in the same operation**.

---

## Project type

<!-- Set one: nodejs | nextjs | nestjs | flutter -->
**Framework:** `nestjs`
**Package manager:** `npm`

---

## README registry

All READMEs live in the `readme/` directory at the project root.
These files focus on system-wide patterns and end-to-end flows rather than individual directory logic.

### Core Documentation

| Path | Covers |
|---|---|
| `AGENTS.md` | Agent registry and deployment info |
| `PROJECT_STRUCTURE.md` | Project structure for this framework |
| `README.md` | General project overview |
| `readme/ARCHITECTURE.md` | High-level system architecture and data flow |

### Feature flow docs (`readme/flows/`)

| Path | Covers |
|---|---|
| `readme/flows/auth.md` | Signup-tenant, register, login/email, refresh, RBAC |
| `readme/flows/booking.md` | Seat map, Postgres-based seat lock, booking creation, expiry cron |
| `readme/flows/payment.md` | Razorpay order creation + webhook verification + ticket issuance |
| `readme/flows/catalog.md` | Cinema/Screen/Seat/Movie/Showtime CRUD + tenant ownership checks |

### Method docs (`readme/methods/`)

| Path | Covers |
|---|---|
| `readme/methods/typeorm.md` | Entities, migrations, data-source config |

### Folder-based Documentation (one file per feature/topic)

| Folder | Covers | Naming convention |
|---|---|---|
| `readme/flows/` | End-to-end feature flows and data pathways | `<feature>.md` e.g. `auth.md`, `payment.md` |
| `readme/methods/` | Shared utility methods and helpers reference | `<domain>.md` e.g. `validation.md`, `date.md` |
| `readme/ui/` | UI patterns, component conventions | `<component-or-pattern>.md` |
| `readme/theming/` | Design tokens, colour palette, dark-mode rules | `<topic>.md` e.g. `tokens.md`, `dark-mode.md` |

Each folder contains one file per feature or topic. Never merge multiple unrelated features into one file.

---

## Sync rules for Claude

1. **Before editing any file** — read the relevant doc in `readme/flows/`, `readme/methods/`, `readme/ui/`, or `readme/theming/` that covers the feature being changed.
2. **After editing any file** — update the relevant file in the matching `readme/` subfolder to reflect the change.
3. **After adding a new feature or flow** — create `readme/flows/<feature>.md` for that feature. Do not append to another feature's file.
4. **After adding shared utility methods** — create or update `readme/methods/<domain>.md` for that domain only.
5. **After touching theme/style tokens** — update or create the relevant file in `readme/theming/`.
6. **Never leave a README out of date** — a stale README is treated as a bug.
7. **No per-directory READMEs** — do not create `README.md` files in inner folders or for individual modules. Documentation must focus on flows and patterns in `readme/` subfolders.
8. **One feature per file** — never put two unrelated features in the same doc file. Split instead of merge to avoid conflicts when multiple developers work in parallel.
9. **Enforced automatically** — a `Stop` hook (`.claude/hooks/check-readme-sync.sh`) blocks turn-end when source code was edited in a session but no `readme/` doc was updated. Don't rely on memory; the hook is the backstop. Wiring + scripts are documented in `.claude/RULES.md §10`.

---

## Skills

See `.claude/skills/` for reusable task instructions. Each is a directory with a `SKILL.md` (auto-discovered). Two layers:

**Universal** (every project, all frameworks):

| Skill | Purpose |
|---|---|
| `.claude/skills/new-feature/SKILL.md` | How to scaffold a new feature |
| `.claude/skills/pr-workflow/SKILL.md` | Branch → commit → PR steps |
| `.claude/skills/readme-sync/SKILL.md` | README update checklist — fires when the doc-sync `Stop` hook blocks |
| `.claude/skills/code-review/SKILL.md` | PR review with risk scoring |
| `.claude/skills/ticket/SKILL.md` | Creating and linking GitHub issues |

**Framework-group** (copied at setup from `frameworks/skills/<group>/` — `backend` for nodejs/nestjs, `frontend` for nextjs, `mobile` for flutter; see `SETUP_PROMPT.md` STEP 2):

| Group | Skills | Reference |
|---|---|---|
| backend | `add-endpoint`, `data-model`, `auth-guard`, `login-methods` | `.claude/skills/OFFICIAL_SKILLS.md` |
| frontend | `add-component`, `add-store`, `add-page-route`, `theming`, `login-form` | `.claude/skills/OFFICIAL_SKILLS.md` |
| mobile | `add-feature`, `add-bloc`, `theming` | `.claude/skills/OFFICIAL_SKILLS.md` |

`OFFICIAL_SKILLS.md` lists official Claude skills/plugins worth fetching on-demand for that stack (don't vendor unused).

---

## Rules reference

All standing instructions live in `.claude/RULES.md`.
Read it at the start of every session.
