---
name: add-endpoint
description: Add a REST endpoint wired through the framework's route/controller/service layers with validation, a service-layer unit test, and a synced flow doc. Use when asked to add or expose a new API endpoint.
---

# Skill: add-endpoint

Use when adding a new REST endpoint to a Node.js (Express-style) or Nest.js backend.

## Steps

1. **Read RULES.md** — `cat .claude/RULES.md`.
2. **Branch from dev**
   ```
   git checkout dev && git pull origin dev && git checkout -b feature/<endpoint-name>
   ```
3. **Detect framework** — check `package.json` for `@nestjs/core` (Nest) vs `express` (Node). Branch the remaining steps on the result.
4. **Node.js — scaffold the layers**
   - `src/routes/<x>.routes.js` — declare the route; register it in `src/routes/index.js`.
   - `src/controllers/<x>.controller.js` — thin handler; parse/validate input, call the service, shape the response via `src/utils/response.util.js`.
   - `src/services/<x>.service.js` — business logic only; no `req`/`res`.
   - **Validate with zod** — define the request schema and validate in the controller (or a `validate` middleware). Do not add a second validation lib.
   - **Error handling** — throw typed errors; let `src/middleware/error.middleware.js` format the response. No `try/catch` that swallows.
   ```
   src/routes/<x>.routes.js → controller → service
   ```
5. **Nest.js — generate/extend the module**
   - Reuse the existing `src/modules/<feature>/` if the resource fits; otherwise scaffold `<feature>.module.ts`, `.controller.ts`, `.service.ts`, `dto/`.
   - **Controller** — add the route method with HTTP decorator (`@Get`/`@Post`/...) and `@nestjs/swagger` decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`).
   - **DTO** — request/response DTOs in `dto/` validated with `class-validator` decorators (rely on the global `ValidationPipe`).
   - **Service** — business logic; inject via constructor. Register providers/exports in `<feature>.module.ts`.
6. **Add a service-layer unit test**
   - Node: `tests/unit/<x>.service.test.js` (`jest`; use `supertest` only for route-level tests).
   - Nest: `test/unit/<feature>.service.spec.ts` (`jest` + `@nestjs/testing`, mock dependencies).
   - Run the suite to confirm green.
7. **Do not modify package.json** — no new dependencies without explicit instruction; use the project's `dayjs`/`axios`/`zod` (or `class-validator`).
8. **Sync docs (enforced)** — update `readme/flows/<feature>.md` (Purpose, Steps, Data Pathways, Dependencies) for the endpoint; register a new flow doc in `CLAUDE.md` if created. A `Stop` hook blocks turn-end if code changed but no `readme/` doc did.
9. **Report back** — branch, files created/changed, test added, docs updated.
