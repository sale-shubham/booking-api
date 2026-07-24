# Payment flow (Razorpay)

`src/modules/payment/payment.service.ts` + `payment.controller.ts`.

## Create order — `POST /bookings/:id/pay` (auth, booking owner only)
Requires the booking to be `pending` and belong to the caller. Creates a Razorpay order for `totalAmount` (converted to paise), saves a `PaymentRecord` (`status=created`, `provider_order_id`), returns `{ orderId, amount, currency, keyId }` for the frontend's Razorpay checkout widget.

## Webhook — `POST /payments/webhook` (public, signature-verified)
- Raw body access requires `rawBody: true` in `NestFactory.create` (`main.ts`) — the handler reads `req.rawBody` (a `Buffer`), never the parsed JSON, because the signature is computed over the exact raw bytes.
- Signature check: HMAC-SHA256(rawBody, `RAZORPAY_WEBHOOK_SECRET`) compared to the `x-razorpay-signature` header via `crypto.timingSafeEqual` (constant-time, avoids timing attacks). Invalid signature → 401, nothing is processed.
- Only handles the `payment.captured` event; anything else returns `{ ignored: event }`.
- Idempotent: looks up `PaymentRecord` by `provider_order_id`; if already `captured`, returns `{ alreadyProcessed: true }` without redoing side effects (protects against Razorpay's at-least-once retry behavior).
- On first capture, one DB transaction: `PaymentRecord` → `captured` + `provider_payment_id`; `Booking` → `paid`; for every `seat_locks` row still attached to that booking, generate a `Ticket` (QR = `qrcode.toDataURL(JSON.stringify({ bookingId, seatId }))`) and then delete those `seat_locks` rows — from this point on the seat's "booked" state lives in `tickets`, not `seat_locks` (see `readme/flows/booking.md` step 1).
