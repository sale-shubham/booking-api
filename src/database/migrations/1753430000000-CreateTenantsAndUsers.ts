import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTenantsAndUsers1753430000000 implements MigrationInterface {
  name = 'CreateTenantsAndUsers1753430000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "subdomain" text NOT NULL UNIQUE,
        "plan_id" text NOT NULL DEFAULT 'free',
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE TYPE "users_role_enum" AS ENUM ('super_admin', 'cinema_admin', 'attendee')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "role" "users_role_enum" NOT NULL DEFAULT 'attendee',
        "tenant_id" uuid REFERENCES "tenants"("id") ON DELETE CASCADE,
        "username" text,
        "email" text,
        "phone" text,
        "password_hash" text,
        "otp_code" text,
        "otp_expires_at" timestamptz,
        "otp_attempts" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_users_username" ON "users" ("username") WHERE "username" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_users_email" ON "users" ("email") WHERE "email" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_users_phone" ON "users" ("phone") WHERE "phone" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
  }
}
