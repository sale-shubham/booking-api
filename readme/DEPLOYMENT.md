# Deployment (AWS Lambda via Serverless Framework)

Pattern mirrored from the `p2x/pcecommerce_api` reference project, adapted from its Express+Prisma+tsx stack to this repo's NestJS+TypeORM+compiled-`dist/` stack.

## Entry points
- `src/main.ts` — local dev (`npm run start:dev`/`start:prod`), calls `app.listen(port)`, also serves Swagger at `/docs`.
- `src/bootstrap.ts` — `configureApp(app)`: the CORS/cookie-parser/ValidationPipe/HttpExceptionFilter wiring shared by both entry points, so main.ts and lambda.ts can't drift.
- `src/lambda.ts` — two Lambda handlers (compiled to `dist/lambda.js` by `nest build`, same as everything else in `src/`):
  - `handler` — the HTTP entry point. Boots Nest with an `ExpressAdapter`, wraps it with `@codegenie/serverless-express`, and **caches the wrapped server across invocations** (`cachedServer` module-level variable) so a warm Lambda container doesn't re-bootstrap Nest on every request.
  - `expireSeatLocksHandler` — a **separate**, non-HTTP handler that boots Nest in application-context mode (`NestFactory.createApplicationContext`, no HTTP server) and calls `BookingService.releaseExpiredLocks()` directly, then closes the app. This exists because `BookingService`'s in-process `@Cron(EVERY_MINUTE)` (used for local/single-server deployments) cannot fire reliably in Lambda — nothing keeps a container's event loop alive between invocations, so the cron would silently stop running. `serverless.yml` schedules this handler via EventBridge (`rate(1 minute)`) instead.

## `serverless.yml`
- `provider.httpApi` — AWS HTTP API (API Gateway v2) proxying every path (`/{proxy+}`, all methods) to the `api` function.
- `package.excludeDevDependencies: true` + explicit `package.patterns` — ships only `dist/` + pruned `node_modules` (no `src/`, `.git/`, docs, `.env*`, migrations — those run via CI, not from the Lambda bundle).
- `environment:` block maps every `.env` var this app needs (see `readme/ARCHITECTURE.md` § Env vars) to `${env:VAR_NAME}` — populated by the deploy workflow, not committed.
- Two functions: `api` (HTTP) and `expireSeatLocks` (scheduled) — see entry points above.

## `.github/workflows/`
- `dev_build.yml` — on every PR into `dev`: `npm ci` → `npm run typecheck` → `npm run build`. Pure CI gate, no deploy.
- `deploy_serverless.yml` — on push to `dev` (deploys stage `dev`) or `main` (deploys stage `prod`), or manual `workflow_dispatch`: installs deps, builds, installs the `serverless` CLI globally, resolves stage-specific secrets/vars into env, runs `npm run migration:run` against the target database, then `sls deploy --stage <stage>`.
  - Expected repo secrets: `AWS_ACCESS_KEY_ID[_PROD]`, `AWS_SECRET_ACCESS_KEY[_PROD]`, `DATABASE_URL[_PROD]`, `RAZORPAY_KEY_ID[_PROD]`, `RAZORPAY_KEY_SECRET[_PROD]`, `RAZORPAY_WEBHOOK_SECRET[_PROD]`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `SERVERLESS_ACCESS_KEY`.
  - Expected repo vars: `AWS_REGION`, `CORS_ORIGIN[_PROD]`, `AUTH_METHODS`, `SEAT_LOCK_TTL_MINUTES`.

## Local dev vs. Lambda
Local dev (`npm run start:dev`) never touches `lambda.ts` — it's unaffected by any of this. The two entry points diverge only at the Nest bootstrap boundary (`app.listen()` vs. `serverlessExpress(...)`/`createApplicationContext()`), sharing every actual app-configuration line via `bootstrap.ts`.
