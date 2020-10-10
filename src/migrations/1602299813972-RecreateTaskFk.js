/* eslint-disable class-methods-use-this */

// Migration
/**
 * @implements {import("typeorm").MigrationInterface}
 */
export default class RecreateTaskFk1602299813972 {
  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async up(queryRunner) {
    // Drop and recreate task FK
    await queryRunner.query(
      `ALTER TABLE "task_completed_days_day" DROP CONSTRAINT "FK_ffb64c1dfb28aedde4958e45432"`
    );
    await queryRunner.query(
      `CREATE SEQUENCE "task_id_seq" OWNED BY "task"."id"`
    );
    await queryRunner.query(
      `ALTER TABLE "task" ALTER COLUMN "id" SET DEFAULT nextval('task_id_seq')`
    );
    await queryRunner.query(
      `ALTER TABLE "task" ALTER COLUMN "id" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "task_completed_days_day" ADD CONSTRAINT "FK_ffb64c1dfb28aedde4958e45432" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async down(queryRunner) {
    // Drop and recreate task FK
    await queryRunner.query(
      `ALTER TABLE "task_completed_days_day" DROP CONSTRAINT "FK_ffb64c1dfb28aedde4958e45432"`
    );
    await queryRunner.query(
      `ALTER TABLE "task" ALTER COLUMN "id" SET DEFAULT nextval('goal_id_seq')`
    );
    await queryRunner.query(
      `ALTER TABLE "task" ALTER COLUMN "id" DROP DEFAULT`
    );
    await queryRunner.query(`DROP SEQUENCE "task_id_seq"`);
    await queryRunner.query(
      `ALTER TABLE "task_completed_days_day" ADD CONSTRAINT "FK_ffb64c1dfb28aedde4958e45432" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}
