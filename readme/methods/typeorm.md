# TypeORM setup

- Config: `src/database/data-source.ts` (CLI target, reads `DATABASE_URL` directly via `dotenv/config`) and `src/database/database.module.ts` (`TypeOrmModule.forRootAsync`, reads through `ConfigService`). Both list every entity in the exported `ENTITIES` array in `database.module.ts` — keep it in sync when adding an entity.
- `synchronize: false` always. `ssl: { rejectUnauthorized: false }` — required for Supabase's pooled connection.
- Migrations live in `src/database/migrations/`, run via `npm run migration:run` (`npm run typeorm -- migration:run` under the hood, pointed at `data-source.ts`). Written by hand as raw SQL (`queryRunner.query(...)`) rather than `migration:generate`, since generation needs a live DB connection to diff against and `DATABASE_URL` isn't available until the user supplies their Supabase connection string.
- Current migrations, in order: `CreateTenantsAndUsers` → `CreateCinemaScreenSeat` → `CreateMovieShowtime` → `CreateBookingSeatLockTicketPayment`.

## Entities
| Entity | Table | Key relations |
|---|---|---|
| `Tenant` | `tenants` | has many `User`, `Cinema`, `Movie` |
| `User` | `users` | belongs to `Tenant` (nullable — attendees have none) |
| `Cinema` | `cinemas` | belongs to `Tenant`; has many `Screen` |
| `Screen` | `screens` | belongs to `Cinema`; has many `Seat` |
| `Seat` | `seats` | belongs to `Screen`; unique on `(screen_id, row, col)` |
| `Movie` | `movies` | belongs to `Tenant` |
| `Showtime` | `showtimes` | belongs to `Movie` + `Screen` |
| `SeatLock` | `seat_locks` | transient hold; unique on `(showtime_id, seat_id)` — see `readme/flows/booking.md` |
| `Booking` | `bookings` | belongs to `User` + `Showtime`; has many `Ticket` |
| `Ticket` | `tickets` | belongs to `Booking` + `Seat` |
| `PaymentRecord` | `payment_records` | belongs to `Booking` |

## Dependencies added this phase
`@nestjs/config`, `@nestjs/typeorm`, `typeorm`, `pg`, `@nestjs/jwt`, `@nestjs/passport` + `passport`/`passport-jwt`, `bcryptjs`, `class-validator`/`class-transformer`, `@nestjs/swagger`, `qrcode`, `razorpay`, `@nestjs/schedule`, `cookie-parser`, `dayjs`, `zod`.
