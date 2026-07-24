# Architecture

## Runtime
- NestJS 11 (Express platform), TypeScript, TypeORM 1.x + PostgreSQL (Supabase-hosted, no local Docker).
- `synchronize: false` always — schema changes go through `src/database/migrations/`.
- Global `JwtAuthGuard` + `RolesGuard` (registered as `APP_GUARD` in `src/app.module.ts`) protect every route by default; opt out with `@Public()` (`src/common/decorators/public.decorator.ts`), opt into a role with `@Roles(UserRole.X)` (`src/common/decorators/roles.decorator.ts`).
- Global `ValidationPipe` (whitelist + transform), global `HttpExceptionFilter` (`src/common/filters/http-exception.filter.ts`) for consistent error JSON.
- Swagger at `/docs`.

## Multi-tenancy
Shared database, tenant-scoped rows (`tenant_id` column on `Tenant`-owned entities: `User`, `Cinema`, `Movie`; `Screen`/`Seat`/`Showtime` inherit tenant scope transitively via their parent `Cinema`/`Movie`). No subdomain middleware yet (Amplify wildcard routing is a deploy-time concern) — tenant resolution is:
- **Authenticated admin writes** — `tenantId` comes from the JWT payload (`req.user.tenantId`), never trusted from the client body.
- **Public reads** (movie/cinema listing) — caller passes `?tenantId=` explicitly. The frontend resolves which tenant it's browsing (e.g. from the subdomain) and passes it through.

## Request lifecycle
`main.ts` → global pipes/filters/guards → controller (route + DTO validation) → service (business logic, tenant ownership checks) → TypeORM repository → Postgres.

## Env vars (`.env.example`)
`DATABASE_URL` (Supabase connection string), `JWT_SECRET`/`JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_SECRET`/`JWT_REFRESH_EXPIRES_IN`, `AUTH_METHODS` (currently `email_password` only), `SEAT_LOCK_TTL_MINUTES`, `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`/`RAZORPAY_WEBHOOK_SECRET`, `CORS_ORIGIN`. Validated at boot via `src/config/env.validation.ts` (zod) — the app refuses to start if any required var is missing.

## Integrations
- **Razorpay** — order creation (`PaymentService.createOrder`) + webhook (`PaymentService.handleWebhook`), signature-verified via HMAC-SHA256 over the raw request body (`rawBody: true` in `NestFactory.create`, see `main.ts`).
- **qrcode** — ticket QR generated as a data-URL PNG at payment-capture time, stored directly in `tickets.qr_code`.

## Why Postgres-based seat locking, not Redis
No Docker, no separate cache service — see `readme/flows/booking.md` for the full mechanism (`UNIQUE(showtime_id, seat_id)` + conditional `ON CONFLICT ... DO UPDATE ... WHERE expires_at < now()`).
