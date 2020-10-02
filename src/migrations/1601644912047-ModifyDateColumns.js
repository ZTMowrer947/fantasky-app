/* eslint-disable class-methods-use-this */
// Imports
import { TableColumn, TableIndex } from 'typeorm';

// Migration
/**
 * @implements {import("typeorm").MigrationInterface}
 */
export default class ModifyDateColumns1601644912047 {
  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async up(queryRunner) {
    // Get tables involved in operation
    const userTable = await queryRunner.getTable('user');
    const taskTable = await queryRunner.getTable('task');
    const dayTable = await queryRunner.getTable('day');

    // Get indices to drop
    const dateIdx = dayTable.indices.find((idx) =>
      idx.columnNames.includes('date')
    );

    // Drop indices
    await queryRunner.dropIndex(dayTable, dateIdx);

    // Get columns to drop and re-create
    const dateCol = dayTable.columns.find((col) => col.name === 'date');
    const startDateCol = taskTable.columns.find(
      (col) => col.name === 'startDate'
    );
    const dobCol = userTable.columns.find((col) => col.name === 'dob');

    // Drop columns
    await queryRunner.dropColumn(dayTable, dateCol);
    await queryRunner.dropColumn(taskTable, startDateCol);
    await queryRunner.dropColumn(userTable, dobCol);

    // Redefine dropped columns
    const newDateCol = new TableColumn({
      name: 'date',
      type: 'date',
      isNullable: false,
      isUnique: true,
    });

    const newStartDateCol = new TableColumn({
      name: 'startDate',
      type: 'date',
      isNullable: false,
      default: 'CURRENT_DATE',
    });

    const newDobCol = new TableColumn({
      name: 'dob',
      type: 'date',
      isNullable: false,
    });

    // Attach columns to respective tables
    await queryRunner.addColumn(dayTable, newDateCol);
    await queryRunner.addColumn(taskTable, newStartDateCol);
    await queryRunner.addColumn(userTable, newDobCol);

    // Redefine index on date index
    const newDateIdx = new TableIndex({
      columnNames: ['date'],
    });

    // Attach index to respective column
    await queryRunner.createIndex(dayTable, newDateIdx);
  }

  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async down(queryRunner) {
    // Get tables involved in operation
    const userTable = await queryRunner.getTable('user');
    const taskTable = await queryRunner.getTable('task');
    const dayTable = await queryRunner.getTable('day');

    // Get indices to drop
    const dateIdx = dayTable.indices.find((idx) =>
      idx.columnNames.includes('date')
    );

    // Drop indices
    await queryRunner.dropIndex(dayTable, dateIdx);

    // Get columns to drop and re-create
    const dateCol = dayTable.columns.find((col) => col.name === 'date');
    const startDateCol = taskTable.columns.find(
      (col) => col.name === 'startDate'
    );
    const dobCol = userTable.columns.find((col) => col.name === 'dob');

    // Drop columns
    await queryRunner.dropColumn(dayTable, dateCol);
    await queryRunner.dropColumn(taskTable, startDateCol);
    await queryRunner.dropColumn(userTable, dobCol);

    // Redefine original columns
    const prevDateCol = new TableColumn({
      name: 'date',
      type: 'timestamp',
      isNullable: false,
    });

    const prevStartDateCol = new TableColumn({
      name: 'startDate',
      type: 'timestamp',
      isNullable: false,
      default: 'NOW()',
    });

    const prevDobCol = new TableColumn({
      name: 'dob',
      type: 'timestamp',
      isNullable: false,
    });

    // Attach columns to respective tables
    await queryRunner.addColumn(dayTable, prevDateCol);
    await queryRunner.addColumn(taskTable, prevStartDateCol);
    await queryRunner.addColumn(userTable, prevDobCol);

    // Redefine index on date index
    const prevDateIdx = new TableIndex({
      columnNames: ['date'],
    });

    // Attach index to respective column
    await queryRunner.createIndex(dayTable, prevDateIdx);
  }
}
