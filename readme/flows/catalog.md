# Catalog (cinema / screen / seat / movie / showtime)

Four sibling modules, same ownership pattern: `cinema_admin` writes are scoped to `req.user.tenantId`; every service checks the target row's `tenant_id` (or its parent's) matches before allowing update/delete, throwing `ForbiddenException`/`NotFoundException` otherwise. Public reads take `?tenantId=` (see `readme/ARCHITECTURE.md` § Multi-tenancy).

## Cinema (`src/modules/cinema/`)
Plain CRUD: `name`, `city`, `address`, owned by `tenant_id`.

## Screen + Seat (`src/modules/screen/`)
`POST /cinemas/:cinemaId/screens` takes `{ name, totalRows, totalCols, rowCategories? }` — `rowCategories[i]` (0-indexed) sets the `SeatCategory` (`SILVER`/`GOLD`/`RECLINER`) for row `i+1`; unspecified rows default to `SILVER`. The service generates one `Seat` row per grid cell in the same call (`ScreenService.create`) — there is no separate "add seat" endpoint in MVP. `GET /screens/:id/seats` returns the full ordered layout.

## Movie (`src/modules/movie/`)
`title`, `description`, `durationMin`, `language`, `posterUrl`, `rating`, owned by `tenant_id`.

## Showtime (`src/modules/showtime/`)
Links a `Movie` + `Screen` + `startTime` + `priceByCategory` (JSON, e.g. `{"SILVER":150,"GOLD":250,"RECLINER":400}` — used by the booking flow to compute `totalAmount`). Ownership is checked through the parent `Movie`'s `tenant_id` (a showtime doesn't carry its own `tenant_id` column). `findAll`/`findOne` eager-load `relations: { screen: { cinema: true } }` so the frontend can show cinema/screen name per showtime without an extra round trip.
