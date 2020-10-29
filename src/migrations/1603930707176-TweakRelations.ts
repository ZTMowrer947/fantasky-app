import {MigrationInterface, QueryRunner} from "typeorm";

export class TweakRelations1603930707176 implements MigrationInterface {
    name = 'TweakRelations1603930707176'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_94fe6b3a5aec5f85427df4f8cd7"`);
        await queryRunner.query(`DROP INDEX "IDX_20f1f21d6853d9d20d501636eb"`);
        await queryRunner.query(`DROP INDEX "IDX_e4662724cf9f92100be40f24ee"`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "creatorId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_94fe6b3a5aec5f85427df4f8cd7" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_94fe6b3a5aec5f85427df4f8cd7"`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "creatorId" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_e4662724cf9f92100be40f24ee" ON "day" ("date") `);
        await queryRunner.query(`CREATE INDEX "IDX_20f1f21d6853d9d20d501636eb" ON "task" ("name") `);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_94fe6b3a5aec5f85427df4f8cd7" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
