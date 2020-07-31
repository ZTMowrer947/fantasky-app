/* eslint-disable class-methods-use-this */
// Imports
import { TableForeignKey, TableIndex } from 'typeorm';

// Migration
/**
 * @implements {import("typeorm").MigrationInterface}
 */
export default class RenameGoalToTask1596210555575 {
  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async up(queryRunner) {
    // Get tables
    const goalTable = await queryRunner.getTable('goal');
    const goalDayJoinTable = await queryRunner.getTable(
      'goal_completed_days_day'
    );

    // Get columns to update
    const goalIdColumn = goalDayJoinTable.findColumnByName('goalId');

    // Get goal-related foreign keys
    const goalJoinFk = goalDayJoinTable.foreignKeys.find((fk) =>
      fk.columnNames.includes('goalId')
    );

    // Get goal-related indices
    const goalJoinIdx = goalDayJoinTable.indices.find((idx) =>
      idx.columnNames.includes('goalId')
    );

    // Drop goal-related indices
    await queryRunner.dropIndex(goalDayJoinTable, goalJoinIdx);

    // Drop goal-related foreign keys
    await queryRunner.dropForeignKey(goalDayJoinTable, goalJoinFk);

    // Rename goal table to task
    await queryRunner.renameTable(goalTable, 'task');

    // Rename join table
    await queryRunner.renameTable(goalDayJoinTable, 'task_completed_days_day');

    // Get updated tables
    const taskDayJoinTable = await queryRunner.getTable(
      'task_completed_days_day'
    );

    // Rename goalId column
    await queryRunner.renameColumn(taskDayJoinTable, goalIdColumn, 'taskId');

    // Define new index for taskId
    const taskJoinIdx = new TableIndex({
      columnNames: ['taskId'],
    });

    // Define new foreign key for taskId
    const taskJoinFk = new TableForeignKey({
      referencedTableName: 'task',
      columnNames: ['taskId'],
      referencedColumnNames: ['id'],
      onUpdate: 'NO ACTION',
      onDelete: 'CASCADE',
    });

    // Add foreign key to taskId
    await queryRunner.createForeignKey(taskDayJoinTable, taskJoinFk);

    // Add index to taskId
    await queryRunner.createIndex(taskDayJoinTable, taskJoinIdx);
  }

  /**
   * @param {import("typeorm").QueryRunner} queryRunner
   */
  async down(queryRunner) {
    // Get tables
    const taskTable = await queryRunner.getTable('task');
    const taskDayJoinTable = await queryRunner.getTable(
      'task_completed_days_day'
    );

    // Get columns to revert
    const taskIdColumn = taskDayJoinTable.findColumnByName('taskId');

    // Get task-related foreign keys
    const taskJoinFk = taskDayJoinTable.foreignKeys.find((fk) =>
      fk.columnNames.includes('taskId')
    );

    // Get task-related indices
    const taskJoinIdx = taskDayJoinTable.indices.find((idx) =>
      idx.columnNames.includes('taskId')
    );

    // Drop task-related indices
    await queryRunner.dropIndex(taskDayJoinTable, taskJoinIdx);

    // Drop task-related foreign keys
    await queryRunner.dropForeignKey(taskDayJoinTable, taskJoinFk);

    // Rename task table to goal
    await queryRunner.renameTable(taskTable, 'goal');

    // Rename join table
    await queryRunner.renameTable(taskDayJoinTable, 'goal_completed_days_day');

    // Get updated tables
    const goalDayJoinTable = await queryRunner.getTable(
      'goal_completed_days_day'
    );

    // Rename taskId column
    await queryRunner.renameColumn(goalDayJoinTable, taskIdColumn, 'goalId');

    // Define new index for goalId
    const goalJoinIdx = new TableIndex({
      columnNames: ['goalId'],
    });

    // Define new foreign key for goalId
    const goalJoinFk = new TableForeignKey({
      referencedTableName: 'goal',
      columnNames: ['goalId'],
      referencedColumnNames: ['id'],
      onUpdate: 'NO ACTION',
      onDelete: 'CASCADE',
    });

    // Add foreign key to goalId
    await queryRunner.createForeignKey(goalDayJoinTable, goalJoinFk);

    // Add index to goalId
    await queryRunner.createIndex(goalDayJoinTable, goalJoinIdx);
  }
}
