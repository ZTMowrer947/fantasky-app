import { MigrationInterface, QueryRunner } from 'typeorm';

export default class Initial1617643712359 implements MigrationInterface {
  name = 'Initial1617643712359';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `user` (`id` bigint NOT NULL AUTO_INCREMENT, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `firstName` varchar(255) NOT NULL, `lastName` varchar(255) NOT NULL, `emailAddress` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, UNIQUE INDEX `IDX_eea9ba2f6e1bb8cb89c4e672f6` (`emailAddress`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `task` (`id` bigint NOT NULL AUTO_INCREMENT, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `name` varchar(255) NOT NULL, `description` text NULL, `startDate` date NOT NULL, `daysToRepeat` smallint NOT NULL, `creatorId` bigint NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `day` (`id` bigint NOT NULL AUTO_INCREMENT, `date` date NOT NULL, UNIQUE INDEX `IDX_e4662724cf9f92100be40f24ee` (`date`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `task_completed_days_day` (`taskId` bigint NOT NULL, `dayId` bigint NOT NULL, INDEX `IDX_ffb64c1dfb28aedde4958e4543` (`taskId`), INDEX `IDX_3ec35ab07267cf7eaddae54b9e` (`dayId`), PRIMARY KEY (`taskId`, `dayId`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'ALTER TABLE `task` ADD CONSTRAINT `FK_94fe6b3a5aec5f85427df4f8cd7` FOREIGN KEY (`creatorId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `task_completed_days_day` ADD CONSTRAINT `FK_ffb64c1dfb28aedde4958e45432` FOREIGN KEY (`taskId`) REFERENCES `task`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `task_completed_days_day` ADD CONSTRAINT `FK_3ec35ab07267cf7eaddae54b9e8` FOREIGN KEY (`dayId`) REFERENCES `day`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `task_completed_days_day` DROP FOREIGN KEY `FK_3ec35ab07267cf7eaddae54b9e8`'
    );
    await queryRunner.query(
      'ALTER TABLE `task_completed_days_day` DROP FOREIGN KEY `FK_ffb64c1dfb28aedde4958e45432`'
    );
    await queryRunner.query(
      'ALTER TABLE `task` DROP FOREIGN KEY `FK_94fe6b3a5aec5f85427df4f8cd7`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_3ec35ab07267cf7eaddae54b9e` ON `task_completed_days_day`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_ffb64c1dfb28aedde4958e4543` ON `task_completed_days_day`'
    );
    await queryRunner.query('DROP TABLE `task_completed_days_day`');
    await queryRunner.query(
      'DROP INDEX `IDX_e4662724cf9f92100be40f24ee` ON `day`'
    );
    await queryRunner.query('DROP TABLE `day`');
    await queryRunner.query('DROP TABLE `task`');
    await queryRunner.query(
      'DROP INDEX `IDX_eea9ba2f6e1bb8cb89c4e672f6` ON `user`'
    );
    await queryRunner.query('DROP TABLE `user`');
  }
}
