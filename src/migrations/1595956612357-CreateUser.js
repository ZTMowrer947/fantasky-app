/* eslint-disable class-methods-use-this */
// Imports
import { Table } from 'typeorm';

// Migration
/**
 * @implements {import("typeorm").MigrationInterface}
 */
export default class CreateUser1595956612357 {
  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async up(queryRunner) {
    // Define user table structure
    const userTable = new Table({
      name: 'user',
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
          name: 'firstName',
          type: 'character varying',
          isNullable: false,
        },
        {
          name: 'lastName',
          type: 'character varying',
          isNullable: false,
        },
        {
          name: 'emailAddress',
          type: 'character varying',
          isNullable: false,
          isUnique: true,
        },
        {
          name: 'password',
          type: 'character varying',
          isNullable: false,
        },
        {
          name: 'dob',
          type: 'timestamp',
          isNullable: false,
        },
      ],
    });

    // Create table in database
    await queryRunner.createTable(userTable);
  }

  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async down(queryRunner) {
    // Find user table
    const userTable = await queryRunner.getTable('user');

    // If table was not found, throw error
    if (!userTable) {
      throw new Error('Could not find user table for reversion');
    }

    // Drop user table
    await queryRunner.dropTable(userTable);
  }
}
