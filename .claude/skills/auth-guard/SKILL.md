---
name: auth-guard
description: Add an auth or RBAC permission guard/middleware with its permission catalogue, wired into the framework's request pipeline and documented in the auth flow doc. Use when adding or changing authentication or role/permission enforcement.
---

# Skill: auth-guard

Use when adding an auth or RBAC permission guard/middleware.

## Steps

1. **Read RULES.md** — `cat .claude/RULES.md`.
2. **Branch from dev**
   ```
   git checkout dev && git pull origin dev && git checkout -b feature/<guard-name>
   ```
3. **Detect framework** — `@nestjs/core` (Nest) vs `express` (Node), then branch the steps.
4. **Node.js — middleware + permission catalogue**
   - Add/extend `src/middleware/auth.middleware.js`: verify the token, attach `req.user`, then check the required role/permission.
   - Maintain a single permission catalogue (e.g. `src/config/permissions.js` or `src/utils`) mapping roles → permissions; the middleware reads from it — no inline magic strings.
   - Apply the middleware on the relevant routes in `src/routes/*.routes.js`; let `error.middleware.js` format 401/403.
5. **Nest.js — guard + decorator**
   - Add the guard in `src/common/guards/<name>.guard.ts` implementing `CanActivate`.
   - Add a metadata decorator in `src/common/decorators/` (e.g. `@Roles(...)` / `@Permissions(...)`) read by the guard via `Reflector`.
   - Apply with `@UseGuards(...)` at controller/handler level (or register globally in the module if it should be app-wide); keep the role→permission catalogue centralized.
6. **Add a unit test** — cover allow and deny paths (Node: `jest`; Nest: `jest` + `@nestjs/testing` mocking `ExecutionContext`/`Reflector`). Run the suite.
7. **Do not modify package.json** — reuse existing auth/validation deps; no new packages without explicit instruction.
8. **Sync docs (enforced)** — update `readme/flows/auth.md` (or `readme/flows/rbac.md` for permission models): roles, permissions, where the guard applies, and the deny behaviour. A `Stop` hook blocks turn-end if code changed but no `readme/` doc did.
9. **Report back** — branch, guard/middleware and decorator/catalogue files, routes protected, test added, docs updated.
