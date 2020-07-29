/* eslint-disable class-methods-use-this */
// Imports
import { TableColumn } from 'typeorm';

// Migration
/**
 * @implements {import("typeorm").MigrationInterface}
 */
export default class ModifyUserIdToUseBigInt1596025575369 {
  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async up(queryRunner) {
    // Find user table
    const userTable = await queryRunner.getTable('user');

    // If table was not found, throw error
    if (!userTable) {
      throw new Error('Could not find user table for migration');
    }

    // Find id column
    const oldIdCol = userTable.columns.find((col) => col.name === 'id');

    // If column was not found, throw error
    if (!oldIdCol) {
      throw new Error('Could not find id column in user table');
    }

    // Drop primary key constraint and id column
    await queryRunner.dropPrimaryKey(userTable);
    await queryRunner.dropColumn(userTable, oldIdCol);

    // Define new table column
    const newIdCol = new TableColumn({
      name: 'id',
      type: 'bigint',
      isPrimary: true,
      isGenerated: true,
      isNullable: false,
    });

    // Add new id column to user table
    await queryRunner.addColumn(userTable, newIdCol);
  }

  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async down(queryRunner) {
    // Find user table
    const userTable = await queryRunner.getTable('user');

    // If table was not found, throw error
    if (!userTable) {
      throw new Error('Could not find user table for migration');
    }

    // Find id column
    const oldIdCol = userTable.columns.find((col) => col.name === 'id');

    // If column was not found, throw error
    if (!oldIdCol) {
      throw new Error('Could not find id column in user table');
    }

    // Drop primary key constraint and id column
    await queryRunner.dropPrimaryKey(userTable);
    await queryRunner.dropColumn(userTable, oldIdCol);

    // Define previous id column
    const prevIdCol = new TableColumn({
      name: 'id',
      type: 'integer',
      isPrimary: true,
      isGenerated: true,
      isNullable: false,
    });

    // Restore previous id column to user table
    await queryRunner.addColumn(userTable, prevIdCol);
  }
}