/* eslint-disable class-methods-use-this */

// Imports
import { TableColumn, TableForeignKey } from 'typeorm';

// Migration
/**
 * @implements {import("typeorm").MigrationInterface}
 */
export default class AddReminderTimeToTask1601664590005 {
  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async up(queryRunner) {
    // Get task table and join table
    const taskTable = await queryRunner.getTable('task');
    const taskDayJoinTable = await queryRunner.getTable(
      'task_completed_days_day'
    );

    // Define new column
    const reminderTimeCol = new TableColumn({
      name: 'reminderTime',
      type: 'time with time zone',
      isNullable: true,
    });

    // Add column to task table
    await queryRunner.addColumn(taskTable, reminderTimeCol);

    // Get task foriegn key
    const taskFk = taskDayJoinTable.foreignKeys.find(
      (fk) => fk.referencedTableName === 'task'
    );

    // Drop foreign key
    await queryRunner.dropForeignKey(taskDayJoinTable, taskFk);

    // Define new foreign key
    const newTaskFk = new TableForeignKey({
      columnNames: ['taskId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'task',
      onDelete: 'CASCADE',
      onUpdate: 'NO ACTION',
    });

    // Add foriegn key
    await queryRunner.createForeignKey(taskDayJoinTable, newTaskFk);
  }

  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async down(queryRunner) {
    // Get task table and join table
    const taskTable = await queryRunner.getTable('task');
    const taskDayJoinTable = await queryRunner.getTable(
      'task_completed_days_day'
    );

    // Get column to drop
    const reminderTimeCol = taskTable.columns.find(
      (col) => col.name === 'reminderTime'
    );

    // Drop column from task table
    await queryRunner.dropColumn(taskTable, reminderTimeCol);

    // Get task foriegn key
    const taskFk = taskDayJoinTable.foreignKeys.find(
      (fk) => fk.referencedTableName === 'task'
    );

    // Drop foreign key
    await queryRunner.dropForeignKey(taskDayJoinTable, taskFk);

    // Define new foreign key
    const newTaskFk = new TableForeignKey({
      columnNames: ['taskId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'task',
      onDelete: 'CASCADE',
      onUpdate: 'NO ACTION',
    });

    // Add foriegn key
    await queryRunner.createForeignKey(taskDayJoinTable, newTaskFk);
  }
}
