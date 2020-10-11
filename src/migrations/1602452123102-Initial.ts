/* eslint-disable class-methods-use-this */
// Imports
import { MigrationInterface, QueryRunner } from 'typeorm';

// Migration
export default class Initial1602452123102 implements MigrationInterface {
  name = 'Initial1602452123102';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "day" ("id" BIGSERIAL NOT NULL, "date" date NOT NULL, CONSTRAINT "UQ_e4662724cf9f92100be40f24ee0" UNIQUE ("date"), CONSTRAINT "PK_42e726f6b72349f70b25598b50e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e4662724cf9f92100be40f24ee" ON "day" ("date") `
    );
    await queryRunner.query(
      `CREATE TABLE "task" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "description" text, "startDate" date NOT NULL DEFAULT CURRENT_DATE, "reminderTime" TIME WITH TIME ZONE, "daysToRepeat" smallint NOT NULL, "creatorId" bigint NOT NULL, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_20f1f21d6853d9d20d501636eb" ON "task" ("name") `
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "emailAddress" character varying NOT NULL, "password" character varying NOT NULL, "dob" date NOT NULL, CONSTRAINT "UQ_eea9ba2f6e1bb8cb89c4e672f62" UNIQUE ("emailAddress"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "task_completed_days_day" ("taskId" bigint NOT NULL, "dayId" bigint NOT NULL, CONSTRAINT "PK_4bd5ea70d87f8c0b4b053e56799" PRIMARY KEY ("taskId", "dayId"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ffb64c1dfb28aedde4958e4543" ON "task_completed_days_day" ("taskId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3ec35ab07267cf7eaddae54b9e" ON "task_completed_days_day" ("dayId") `
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_94fe6b3a5aec5f85427df4f8cd7" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "task_completed_days_day" ADD CONSTRAINT "FK_ffb64c1dfb28aedde4958e45432" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "task_completed_days_day" ADD CONSTRAINT "FK_3ec35ab07267cf7eaddae54b9e8" FOREIGN KEY ("dayId") REFERENCES "day"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_completed_days_day" DROP CONSTRAINT "FK_3ec35ab07267cf7eaddae54b9e8"`
    );
    await queryRunner.query(
      `ALTER TABLE "task_completed_days_day" DROP CONSTRAINT "FK_ffb64c1dfb28aedde4958e45432"`
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_94fe6b3a5aec5f85427df4f8cd7"`
    );
    await queryRunner.query(`DROP INDEX "IDX_3ec35ab07267cf7eaddae54b9e"`);
    await queryRunner.query(`DROP INDEX "IDX_ffb64c1dfb28aedde4958e4543"`);
    await queryRunner.query(`DROP TABLE "task_completed_days_day"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP INDEX "IDX_20f1f21d6853d9d20d501636eb"`);
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP INDEX "IDX_e4662724cf9f92100be40f24ee"`);
    await queryRunner.query(`DROP TABLE "day"`);
  }
}
