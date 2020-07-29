/* eslint-disable class-methods-use-this */
// Imports
import { Table, TableForeignKey, TableIndex } from 'typeorm';

// Migration
/**
 * @implements {import("typeorm").MigrationInterface}
 */
export default class CreateDay1596039766405 {
  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async up(queryRunner) {
    // Define day table structure
    const dayTable = new Table({
      name: 'day',
      columns: [
        {
          name: 'id',
          type: 'bigint',
          isPrimary: true,
          isGenerated: true,
          isNullable: false,
        },
        {
          name: 'date',
          type: 'timestamp',
          isNullable: false,
        },
      ],
    });

    // Define indices for day table
    const dateIdx = new TableIndex({
      columnNames: ['date'],
    });

    // Define day-to-goal join table structure
    const goalDayJoinTable = new Table({
      name: 'goal_completed_days_day',
      columns: [
        {
          name: 'goalId',
          type: 'bigint',
          isPrimary: true,
          isNullable: false,
        },
        {
          name: 'dayId',
          type: 'bigint',
          isPrimary: true,
          isNullable: false,
        },
      ],
    });

    // Define indices for join table
    const goalIdx = new TableIndex({
      columnNames: ['goalId'],
    });

    const dayIdx = new TableIndex({
      columnNames: ['dayId'],
    });

    // Define foreign keys for join table
    const goalFk = new TableForeignKey({
      referencedTableName: 'goal',
      columnNames: ['goalId'],
      referencedColumnNames: ['id'],
      onUpdate: 'NO ACTION',
      onDelete: 'CASCADE',
    });

    const dayFk = new TableForeignKey({
      referencedTableName: 'day',
      columnNames: ['dayId'],
      referencedColumnNames: ['id'],
      onUpdate: 'NO ACTION',
      onDelete: 'CASCADE',
    });

    // Create goal table
    await queryRunner.createTable(dayTable);

    // Create index on date field
    await queryRunner.createIndex(dayTable, dateIdx);

    // Create goal-to-day join table
    await queryRunner.createTable(goalDayJoinTable);

    // Add indices to join table
    await queryRunner.createIndices(goalDayJoinTable, [goalIdx, dayIdx]);

    // Add foreign keys to joined tables
    await queryRunner.createForeignKeys(goalDayJoinTable, [goalFk, dayFk]);
  }

  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async down(queryRunner) {
    // Find tables
    const dayTable = await queryRunner.getTable('day');
    const goalDayJoinTable = await queryRunner.getTable(
      'goal_completed_days_day'
    );

    // Ensure tables were found
    if (!dayTable || !goalDayJoinTable) {
      throw new Error('Could not find day or join table');
    }

    // Find indices
    const dateIdx = dayTable.indices.find((idx) =>
      idx.columnNames.includes('date')
    );
    const goalIdx = goalDayJoinTable.indices.find((idx) =>
      idx.columnNames.includes('goalId')
    );
    const dayIdx = goalDayJoinTable.indices.find((idx) =>
      idx.columnNames.includes('dayId')
    );

    // Ensure indices were found
    if (!dateIdx || !goalIdx || !dayIdx) {
      throw new Error('Could not find indices to revert');
    }

    // Find foreign keys
    const goalFk = goalDayJoinTable.foreignKeys.find((fk) =>
      fk.columnNames.includes('goalId')
    );
    const dayFk = goalDayJoinTable.foreignKeys.find((fk) =>
      fk.columnNames.includes('dayId')
    );

    // Ensure foreign keys were found
    if (!goalFk || !dayFk) {
      throw new Error('Could not find foreign keys to revert');
    }

    // Drop foreign keys
    await queryRunner.dropForeignKeys(goalDayJoinTable, [goalFk, dayFk]);

    // Drop indices
    await queryRunner.dropIndices(goalDayJoinTable, [goalIdx, dayIdx]);
    await queryRunner.dropIndex(dayTable, dateIdx);

    // Drop tables
    await queryRunner.dropTable(goalDayJoinTable);
    await queryRunner.dropTable(dayTable);
  }
}
