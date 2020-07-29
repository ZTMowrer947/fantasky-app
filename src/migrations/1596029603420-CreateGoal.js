/* eslint-disable class-methods-use-this */
// Imports
import { Table, TableForeignKey, TableIndex } from 'typeorm';

// Migration
/**
 * @implements {import("typeorm").MigrationInterface}
 */
export default class CreateGoal1596029603420 {
  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async up(queryRunner) {
    // Define goal table structure
    const goalTable = new Table({
      name: 'goal',
      columns: [
        {
          name: 'id',
          type: 'integer',
          isPrimary: true,
          isGenerated: true,
          isNullable: false,
        },
        {
          name: 'createdAt',
          type: 'timestamp',
          default: 'NOW()',
          isNullable: false,
        },
        {
          name: 'updatedAt',
          type: 'timestamp',
          default: 'NOW()',
          isNullable: false,
        },
        {
          name: 'deletedAt',
          type: 'timestamp',
          isNullable: true,
        },
        {
          name: 'name',
          type: 'character varying',
          isNullable: false,
        },
        {
          name: 'description',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'startDate',
          type: 'timestamp',
          isNullable: false,
          default: 'NOW()',
        },
        {
          name: 'daysToRepeat',
          type: 'smallint',
          isNullable: false,
        },
        {
          name: 'creatorId',
          type: 'bigint',
          isNullable: false,
        },
      ],
    });

    // Define index on name field
    const nameIdx = new TableIndex({
      columnNames: ['name'],
    });

    // Define foreign key to user table
    const creatorFk = new TableForeignKey({
      columnNames: ['creatorId'],
      referencedTableName: 'user',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Create table
    await queryRunner.createTable(goalTable);

    // Create index
    await queryRunner.createIndex(goalTable, nameIdx);

    // Add foreign key
    await queryRunner.createForeignKey(goalTable, creatorFk);
  }

  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async down(queryRunner) {
    // Find goal table
    const goalTable = await queryRunner.getTable('goal');

    // If table was not found, throw error
    if (!goalTable) {
      throw new Error('Could not find goal table');
    }

    // Find name index
    const nameIdx = goalTable.indices.find((idx) =>
      idx.columnNames.includes('name')
    );

    // If index was not found, throw error
    if (!nameIdx) {
      throw new Error('Could not find name index');
    }

    // Find foreign key to user table
    const creatorFk = goalTable.foreignKeys.find((fk) =>
      fk.columnNames.includes('creatorId')
    );

    // If foreign key was not found, throw error
    if (!creatorFk) {
      throw new Error('Could not find foreign key to user table');
    }

    // Drop foreign key
    await queryRunner.dropForeignKey(goalTable, creatorFk);

    // Drop name index
    await queryRunner.dropIndex(goalTable, nameIdx);

    // Drop goal table
    await queryRunner.dropTable(goalTable);
  }
}
