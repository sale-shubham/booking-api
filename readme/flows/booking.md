# Booking flow (seat lock → pay → ticket)

All logic in `src/modules/booking/booking.service.ts` + `src/modules/payment/payment.service.ts`.

## 1. Seat map — `GET /showtimes/:id/seats` (public)
Loads all `Seat` rows for the showtime's `Screen`, then marks each:
- `booked` — an active `Ticket` exists for that seat joined through a `Booking` with this `showtime_id`.
- `locked` — a live (`expires_at > now`) row in `seat_locks` for this seat+showtime.
- `available` — neither.

## 2. Lock seats — `POST /showtimes/:id/lock-seats` (auth required)
Body: `{ seatIds: string[] }`. Rejects if any seat is already booked (409). Otherwise, inside one DB transaction, for **each** seat runs:
```sql
INSERT INTO seat_locks (showtime_id, seat_id, lock_token, user_id, expires_at)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (showtime_id, seat_id)
DO UPDATE SET lock_token = EXCLUDED.lock_token, user_id = EXCLUDED.user_id, expires_at = EXCLUDED.expires_at
WHERE seat_locks.expires_at < now()
RETURNING id
```
This is the actual concurrency guard — no Redis, no app-level mutex. The `UNIQUE(showtime_id, seat_id)` constraint (migration `1753430000003`) means only one lock row can exist per seat per showtime; the conditional `DO UPDATE ... WHERE expires_at < now()` lets a *new* holder atomically steal an *expired* lock, while a still-live lock makes the statement affect 0 rows (checked via the empty `RETURNING` result) — the whole transaction is rolled back and the caller gets 409 listing which seats were unavailable. All seats in one request succeed or none do.

TTL comes from `SEAT_LOCK_TTL_MINUTES` (config key `seatLockTtlMinutes`, default 10). Returns `{ lockToken, expiresAt, seatIds }`.

## 3. Create booking — `POST /bookings`
Body: `{ showtimeId, lockToken }`. Validates the caller's own live locks exist for that token, computes `totalAmount` from `showtime.priceByCategory[seat.category]`, creates a `pending` `Booking`, and stamps `booking_id` onto the matching `seat_locks` rows.

## 4. Pay — see `readme/flows/payment.md`

## 5. Expiry — `BookingService.releaseExpiredLocks` (`@Cron(CronExpression.EVERY_MINUTE)`)
Finds `seat_locks` with `expires_at < now`, flips any still-`pending` linked `Booking` to `expired`, then deletes those lock rows (freeing the seats for the next request's `ON CONFLICT` insert to succeed outright).
