# Nest.js project structure

```
booking-api/
├── CLAUDE.md                          # Root intelligence hub — lists all README paths
├── AGENTS.md                          # Agent registry
├── .claude/
│   ├── RULES.md                       # Standing instructions (always read first)
│   ├── settings.json                  # Hook wiring (SessionStart/PostToolUse/Stop)
│   ├── hooks/                         # Doc-sync enforcement (log-edit.sh, check-readme-sync.sh)
│   └── skills/
│       ├── new-feature/SKILL.md
│       ├── pr-workflow/SKILL.md
│       ├── readme-sync/SKILL.md       # README sync checklist — fired by Stop hook
│       ├── code-review/SKILL.md
│       ├── ticket/SKILL.md
│       ├── add-endpoint/SKILL.md      # backend-group skill
│       ├── data-model/SKILL.md        # backend-group skill
│       ├── auth-guard/SKILL.md        # backend-group skill
│       ├── login-methods/SKILL.md     # backend-group skill
│       └── OFFICIAL_SKILLS.md         # on-demand official-skill references
├── readme/                            # Central documentation hub
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md                  # Lambda/Serverless Framework, husky/CI
│   ├── flows/
│   │   ├── auth.md
│   │   ├── booking.md
│   │   ├── payment.md
│   │   └── catalog.md
│   └── methods/
│       └── typeorm.md
├── .github/
│   └── workflows/
│       ├── dev_build.yml              # PR-into-dev: typecheck + build
│       └── deploy_serverless.yml      # push to dev/main: sls deploy
├── .husky/
│   └── pre-commit                     # npm run typecheck
├── src/
│   ├── modules/
│   │   ├── auth/                      # entities/user.entity.ts, strategies/jwt.strategy.ts, dto/
│   │   ├── tenant/                    # entities/tenant.entity.ts, dto/
│   │   ├── cinema/                    # entities/cinema.entity.ts, dto/
│   │   ├── screen/                    # entities/screen.entity.ts + seat.entity.ts, dto/
│   │   ├── movie/                     # entities/movie.entity.ts, dto/
│   │   ├── showtime/                  # entities/showtime.entity.ts, dto/
│   │   ├── booking/                   # entities/{seat-lock,booking,ticket}.entity.ts, dto/
│   │   └── payment/                   # entities/payment-record.entity.ts
│   ├── common/
│   │   ├── decorators/                # public, roles, current-user
│   │   ├── filters/                   # http-exception.filter.ts
│   │   └── guards/                    # jwt-auth.guard.ts, roles.guard.ts
│   ├── config/
│   │   ├── configuration.ts           # AUTH_METHOD_TITLES + config factory
│   │   └── env.validation.ts          # zod env schema
│   ├── database/
│   │   ├── database.module.ts         # TypeOrmModule.forRootAsync + ENTITIES list
│   │   ├── data-source.ts             # CLI data source (migrations)
│   │   └── migrations/
│   ├── app.module.ts
│   ├── bootstrap.ts                   # configureApp() — shared by main.ts and lambda.ts
│   ├── main.ts                        # local dev entry point (app.listen)
│   └── lambda.ts                      # AWS Lambda entry points (see readme/DEPLOYMENT.md)
├── test/                              # default nest-scaffolded jest e2e config (unit tests skipped this MVP phase)
├── serverless.yml                     # AWS Lambda deploy config (Serverless Framework v4)
├── .env.example
├── .gitignore
├── .claudeignore                      # Same as .gitignore (kept in sync)
├── tsconfig.json
├── nest-cli.json
└── package.json
```

## Package conventions

| Concern | Package |
|---|---|
| Date/time | `dayjs` |
| Validation | `class-validator` (DTOs) + `zod` (env config) |
| HTTP client | `axios` (not yet used server-side — no outbound REST calls beyond the Razorpay SDK) |
| ORM | `typeorm` (Postgres, Supabase-hosted) |
| Auth | `@nestjs/passport` + `passport-jwt`, `bcryptjs` |
| Payments | `razorpay` |
| Scheduling | `@nestjs/schedule` (seat-lock expiry cron) |
| QR codes | `qrcode` |
| API docs | `@nestjs/swagger` |
| Lambda adapter | `@codegenie/serverless-express` (see `readme/DEPLOYMENT.md`) |
| Git hooks | `husky` (`.husky/pre-commit` runs `npm run typecheck`) |
| Testing | `jest` + `@nestjs/testing` (scaffolded; no new tests authored this MVP phase per project instruction) |

## Framework Versions

- Nest.js: v11.1.28
- Node.js: v24.18.0
- TypeORM: v1.1.0

## Default branches

- `main` — production-ready, protected
- `dev` — integration; all feature PRs target this branch
