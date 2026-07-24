import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCinemaScreenSeat1753430000001 implements MigrationInterface {
  name = 'CreateCinemaScreenSeat1753430000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "cinemas" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "name" text NOT NULL,
        "city" text NOT NULL,
        "address" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "screens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "cinema_id" uuid NOT NULL REFERENCES "cinemas"("id") ON DELETE CASCADE,
        "name" text NOT NULL,
        "total_rows" integer NOT NULL,
        "total_cols" integer NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE TYPE "seats_category_enum" AS ENUM ('SILVER', 'GOLD', 'RECLINER')`,
    );

    await queryRunner.query(`
      CREATE TABLE "seats" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "screen_id" uuid NOT NULL REFERENCES "screens"("id") ON DELETE CASCADE,
        "row" integer NOT NULL,
        "col" integer NOT NULL,
        "category" "seats_category_enum" NOT NULL DEFAULT 'SILVER',
        UNIQUE ("screen_id", "row", "col")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "seats"`);
    await queryRunner.query(`DROP TYPE "seats_category_enum"`);
    await queryRunner.query(`DROP TABLE "screens"`);
    await queryRunner.query(`DROP TABLE "cinemas"`);
  }
}
