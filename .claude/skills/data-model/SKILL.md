---
name: data-model
description: Add or modify a database model/entity with a generated-and-applied migration, seed update, and ORM method docs, ORM-agnostic across typeorm and prisma. Use when adding or changing a DB model, entity, column, or relation.
---

# Skill: data-model

Use when adding or modifying a database model/entity and its migration.

## Steps

1. **Read RULES.md** — `cat .claude/RULES.md`.
2. **Branch from dev**
   ```
   git checkout dev && git pull origin dev && git checkout -b feature/<model-name>
   ```
3. **Detect the ORM** — inspect `package.json` / `src/database` for `typeorm` vs `prisma`. The project uses exactly one; do not introduce the other.
4. **Apply the schema change**
   - **Node.js** — edit `src/models/<x>.model.js` (or the ORM schema it wraps).
   - **Nest.js** — edit `src/modules/<feature>/entities/<x>.entity.ts` (TypeORM) or `schema.prisma` (Prisma).
   - Keep relations, indexes, and nullability explicit.
5. **Generate + run the migration**
   ```
   # typeorm
   npm run typeorm migration:generate -- src/database/migrations/<Name>
   npm run typeorm migration:run
   # prisma
   npx prisma migrate dev --name <name>
   ```
   Never hand-edit applied migrations; generate a new one for further changes.
6. **Update the seed** — if a seed/fixture script exists (`src/database/seeds`, `prisma/seed.ts`), extend it to cover the new/changed fields so seeding stays runnable.
7. **New env var? (e.g. new DB/connection setting)**
   - Add it to `validateEnv` / `src/config` schema (zod for config).
   - Add it to `.env.example` with a placeholder.
   - Document it in `readme/ARCHITECTURE.md`.
8. **Do not modify package.json** — no new ORM/driver packages without explicit instruction.
9. **Sync docs (enforced)** — update `readme/methods/<orm>.md` (e.g. `readme/methods/typeorm.md` or `prisma.md`) describing the model, fields, relations, and migration name. A `Stop` hook blocks turn-end if code changed but no `readme/` doc did.
10. **Report back** — branch, model/entity changed, migration name, seed/env/config updates, docs updated.
