// Imports
import { plainToClass } from 'class-transformer';
import { date, random } from 'faker';
import { DateTime } from 'luxon';

import UpsertTaskDto from '@/dto/UpsertTaskDto';
import Task from '@/entities/Task';

// Test helpers
function generateFakeTaskData() {
  // Define start date and convert to string
  const startDate = DateTime.fromJSDate(date.soon(64), {
    zone: 'utc',
  }).toSQLDate();

  // Define test task data
  const taskData = {
    name: random.words(3),
    description: null,
    reminderTime: null,
    startDate,
    activeDays: {
      sun: random.boolean(),
      mon: random.boolean(),
      tue: random.boolean(),
      wed: random.boolean(),
      thu: random.boolean(),
      fri: random.boolean(),
      sat: random.boolean(),
    },
  };

  // Return generated task data
  return taskData;
}

function generateFakeTaskDto() {
  // Generate task data
  const taskData = generateFakeTaskData();

  // Convert to DTO class
  const taskDto = plainToClass(UpsertTaskDto, taskData);

  // Return generated task
  return taskDto;
}

function generateFakeTask(user) {
  // Generate task data
  const { activeDays, ...taskData } = generateFakeTaskData();

  // Convert repeating days to database format
  const daysToRepeat = [
    activeDays.sun,
    activeDays.mon,
    activeDays.tue,
    activeDays.wed,
    activeDays.thu,
    activeDays.fri,
    activeDays.sat,
  ]
    .reverse()
    .reduce((accum, dayEnabled, index) => accum + +dayEnabled * 2 ** index, 0);

  // Convert to task entity
  const task = plainToClass(Task, taskData);

  // Attach repeating days and user to task
  task.daysToRepeat = daysToRepeat;
  task.creator = user;

  // Return generated task
  return task;
}

// Exports
export { generateFakeTask, generateFakeTaskDto };
