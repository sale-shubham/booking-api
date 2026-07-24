import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingSeatLockTicketPayment1753430000003 implements MigrationInterface {
  name = 'CreateBookingSeatLockTicketPayment1753430000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "bookings_status_enum" AS ENUM ('pending', 'paid', 'expired', 'cancelled')`,
    );

    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "showtime_id" uuid NOT NULL REFERENCES "showtimes"("id") ON DELETE CASCADE,
        "lock_token" text NOT NULL,
        "status" "bookings_status_enum" NOT NULL DEFAULT 'pending',
        "total_amount" numeric(12,2) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_bookings_status" ON "bookings" ("status")`);

    await queryRunner.query(`
      CREATE TABLE "seat_locks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "showtime_id" uuid NOT NULL REFERENCES "showtimes"("id") ON DELETE CASCADE,
        "seat_id" uuid NOT NULL REFERENCES "seats"("id") ON DELETE CASCADE,
        "lock_token" text NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "booking_id" uuid REFERENCES "bookings"("id") ON DELETE SET NULL,
        "expires_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        UNIQUE ("showtime_id", "seat_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_seat_locks_expires_at" ON "seat_locks" ("expires_at")`,
    );

    await queryRunner.query(
      `CREATE TYPE "tickets_status_enum" AS ENUM ('active', 'used')`,
    );

    await queryRunner.query(`
      CREATE TABLE "tickets" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
        "seat_id" uuid NOT NULL REFERENCES "seats"("id"),
        "qr_code" text NOT NULL,
        "status" "tickets_status_enum" NOT NULL DEFAULT 'active',
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE TYPE "payment_records_status_enum" AS ENUM ('created', 'captured', 'failed')`,
    );

    await queryRunner.query(`
      CREATE TABLE "payment_records" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
        "provider" text NOT NULL DEFAULT 'razorpay',
        "provider_order_id" text,
        "provider_payment_id" text,
        "status" "payment_records_status_enum" NOT NULL DEFAULT 'created',
        "amount" numeric(12,2) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payment_records"`);
    await queryRunner.query(`DROP TYPE "payment_records_status_enum"`);
    await queryRunner.query(`DROP TABLE "tickets"`);
    await queryRunner.query(`DROP TYPE "tickets_status_enum"`);
    await queryRunner.query(`DROP TABLE "seat_locks"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TYPE "bookings_status_enum"`);
  }
}
