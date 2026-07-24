---
name: login-methods
description: Add a configurable multi-login-method auth layer (username/password, email/password, email OTP, mobile OTP) where the user model stores all method fields but only env-enabled methods are wired, with an authMethods config gate and a public GET /auth/methods discovery endpoint. Use when adding or changing which login methods a backend supports.
---

# Skill: login-methods

Use when adding or changing the set of login methods a Node.js (Express-style) or Nest.js backend supports. The data model carries fields for **all four** methods; only the methods listed in `AUTH_METHODS` are wired into routes.

## Canonical contract

- **Method keys → titles** (use exactly): `username_password`="Username & Password", `email_password`="Email & Password", `email_otp`="Email & OTP", `mobile_otp`="Mobile & OTP".
- **Selector** — env `AUTH_METHODS` (comma-separated, default `username_password`) feeds an `authMethods` config module exposing `enabledMethods` + `isEnabled(key)`. Register only enabled flows.
- **Shared user fields (always present)** — `username, email, phone, password_hash, otp_code, otp_expires_at, otp_attempts`.
- **Routes** — `POST /auth/login` (username+password), `POST /auth/login/email` (email+password), `POST /auth/otp/request {identifier, channel}` (`channel` = `email`|`mobile`), `POST /auth/otp/verify {identifier, code}`, `GET /auth/methods` (public — returns enabled `{key,title}` list).

## Steps

1. **Read RULES.md** — `cat .claude/RULES.md`.
2. **Branch from dev**
   ```
   git checkout dev && git pull origin dev && git checkout -b feature/login-methods
   ```
3. **Detect framework** — check `package.json` for `@nestjs/core` (Nest) vs `express` (Node). Branch the remaining steps on the result.
4. **Define the shared user fields (all four methods, always present)** — add to the user model regardless of which methods are enabled, so enabling a method later needs no migration:
   `username`, `email`, `phone`, `password_hash`, `otp_code` (bcrypt hash of the current OTP, nullable), `otp_expires_at` (nullable timestamp), `otp_attempts` (int, default 0). Keep `username`/`email`/`phone` nullable+unique; an account populates only the fields its method needs. (Use the `data-model` skill for the migration mechanics.)
5. **Add the `authMethods` config gate**
   - **Node.js** — `src/config/authMethods.js`: read `process.env.AUTH_METHODS` (default `username_password`), split/trim into `enabledMethods`, validate each against the 4 known keys (throw on unknown), and export `enabledMethods` + `isEnabled(key)`. Add `AUTH_METHODS` to the config/`validateEnv` schema and `.env.example`.
   - **Nest.js** — same logic in `src/config/configuration.ts` (or an `AuthMethodsService` in the auth module) exposing `enabledMethods` + `isEnabled(key)`; register `AUTH_METHODS` in the config schema and `.env.example`.
6. **Node.js — wire the flows (Express)**
   - `src/routes/auth.routes.js` — register a route **only if** `isEnabled(key)`: `username_password`→`POST /auth/login`, `email_password`→`POST /auth/login/email`, `email_otp`/`mobile_otp`→`POST /auth/otp/request` + `POST /auth/otp/verify` (register the OTP pair if either OTP method is enabled). Always register `GET /auth/methods`.
   - `src/controllers/auth.controller.js` — thin handlers; validate input with the project's existing validator (**zod** or **joi** — match what the project uses, add neither if one exists), call the service, shape via `src/utils/response.util.js`.
   - `src/services/auth.service.js` — password verify with **bcryptjs** (`bcrypt.compare` against `password_hash`); OTP logic per step 8. No `req`/`res` in the service.
7. **Nest.js — wire the flows**
   - In the auth module's `auth.controller.ts`, gate handlers on `authMethods.isEnabled(key)` (e.g. throw/skip registration via a guard or conditional in the module) so disabled methods are not exposed.
   - **DTOs** in `dto/` validated with `class-validator` (`LoginDto`, `EmailLoginDto`, `OtpRequestDto` with `channel` `email|mobile`, `OtpVerifyDto`); rely on the global `ValidationPipe`.
   - `auth.service.ts` — password verify with **bcryptjs**; OTP logic per step 8. Add `@nestjs/swagger` decorators on the controller.
8. **OTP generation + verify pattern** (shared by `email_otp` and `mobile_otp`)
   - **Request** — resolve the user by `identifier` (email or phone per `channel`), generate a 6-digit numeric code with `crypto.randomInt(100000, 1000000)`, store `bcrypt.hash(code)` in `otp_code`, set `otp_expires_at = now + 10 min`, reset `otp_attempts = 0`, then **deliver (STUBBED)**: log the code in dev; real email/SMS needs a delivery service — note it in docs, add **no new packages**.
   - **Verify** — reject if no `otp_code`, if `now > otp_expires_at` (expired), or if `otp_attempts >= 5` (capped). Increment `otp_attempts` on each failed `bcrypt.compare`; on success clear `otp_code`/`otp_expires_at`/`otp_attempts` and issue the session/token.
9. **`GET /auth/methods` (public)** — no auth; return `enabledMethods.map(key => ({ key, title }))` using the canonical titles so the frontend auto-adapts.
10. **Add a service-layer unit test**
    - Node: `tests/unit/auth.service.test.js` (`jest`).
    - Nest: `test/unit/auth.service.spec.ts` (`jest` + `@nestjs/testing`, mock the user repo).
    - Cover: password verify pass/fail, OTP expiry, OTP attempt cap, and that a disabled method is not enabled. Run the suite to confirm green.
11. **Do not modify package.json** — reuse `bcryptjs`, the existing validator (`zod`/`joi`/`class-validator`), and Node's built-in `crypto`. No new packages without explicit instruction.
12. **Sync docs (enforced)** — update `readme/flows/auth.md` (methods, `AUTH_METHODS` gating, `GET /auth/methods`, password flows) and `readme/flows/otp.md` (request/verify, 6-digit, 10-min expiry, 5-attempt cap, stubbed delivery). Register new flow docs in `CLAUDE.md`. A `Stop` hook blocks turn-end if code changed but no `readme/` doc did.
13. **Report back** — branch, model fields, `authMethods` config, routes registered (and which were gated off), OTP pattern, test added, docs updated.
