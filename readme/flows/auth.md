# Auth flow

## Methods
Only `email_password` is enabled for MVP (`AUTH_METHODS=email_password` in `.env`). The `User` entity (`src/modules/auth/entities/user.entity.ts`) still carries the full field set for all four canonical login methods (`username`, `email`, `phone`, `password_hash`, `otp_code`, `otp_expires_at`, `otp_attempts`) so enabling `mobile_otp`/`email_otp`/`username_password` later needs no migration — just gate + route wiring in `AuthService`/`AuthController`.

`GET /auth/methods` (public) returns the enabled set from `src/config/configuration.ts` (`AUTH_METHOD_TITLES` + `authMethods` config key) — the frontend's login form renders only what this returns.

## Routes (`src/modules/auth/auth.controller.ts`)
- `POST /auth/signup-tenant` — bootstraps a new cinema chain: creates `Tenant` + a `cinema_admin` `User` in one call. Body: `tenantName`, `subdomain`, `adminEmail`, `adminPassword`.
- `POST /auth/register` — attendee self-signup (`role=attendee`, `tenantId=null` — attendees aren't scoped to a tenant, they browse/book across chains).
- `POST /auth/login/email` — email + password.
- `POST /auth/refresh` — reads the `refresh_token` httpOnly cookie (path `/auth`), issues a new access+refresh pair.
- `POST /auth/logout` — clears the cookie (stateless JWT, no server-side revocation list in MVP).
- `GET /auth/me` — current user profile (password/OTP fields stripped).

## Tokens
- Access token: JWT signed with `JWT_SECRET`, `{ sub, role, tenantId }`, expires `JWT_ACCESS_EXPIRES_IN` (default 15m). Returned in the response body — frontend sends it as `Authorization: Bearer <token>`.
- Refresh token: JWT signed with `JWT_REFRESH_SECRET`, `{ sub }`, expires `JWT_REFRESH_EXPIRES_IN` (default 7d). Set as an httpOnly, `sameSite=lax` cookie scoped to `/auth` — never exposed to JS.

## RBAC
`UserRole` enum: `super_admin`, `cinema_admin`, `attendee` (`src/modules/auth/entities/user.entity.ts`). `@Roles(...)` (`src/common/decorators/roles.decorator.ts`) + global `RolesGuard` (`src/common/guards/roles.guard.ts`) enforce it; routes with no `@Roles()` are open to any authenticated user, routes with `@Public()` skip auth entirely (`src/common/guards/jwt-auth.guard.ts` checks this via `Reflector`).
