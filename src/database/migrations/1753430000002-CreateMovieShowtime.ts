import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMovieShowtime1753430000002 implements MigrationInterface {
  name = 'CreateMovieShowtime1753430000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "movies" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "title" text NOT NULL,
        "description" text,
        "duration_min" integer NOT NULL,
        "language" text NOT NULL,
        "poster_url" text,
        "rating" double precision,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "showtimes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "movie_id" uuid NOT NULL REFERENCES "movies"("id") ON DELETE CASCADE,
        "screen_id" uuid NOT NULL REFERENCES "screens"("id") ON DELETE CASCADE,
        "start_time" timestamptz NOT NULL,
        "price_by_category" jsonb NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_showtimes_movie_id" ON "showtimes" ("movie_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_showtimes_screen_id_start_time" ON "showtimes" ("screen_id", "start_time")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "showtimes"`);
    await queryRunner.query(`DROP TABLE "movies"`);
  }
}
