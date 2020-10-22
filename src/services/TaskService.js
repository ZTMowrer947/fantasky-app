// Imports
import { DateTime } from 'luxon';

import Task from '../entities/Task';

// Service
class TaskService {
  /**
   * @type {import("typeorm").Repository}
   */
  #repository;

  /**
   * @param {import("typeorm").Connection} connection
   */
  constructor(connection) {
    this.#repository = connection.getRepository(Task);
  }

  async findAllForUser(userId) {
    // Create query for task
    const query = this.#repository
      .createQueryBuilder('task')
      .leftJoin('task.creator', 'creator')
      .leftJoinAndSelect('task.completedDays', 'day')
      .addSelect('creator.id')
      .where('creator.id = :userId', { userId });

    // Execute query and get results
    return query.getMany();
  }

  async findById(id) {
    // Create query for task
    const query = this.#repository
      .createQueryBuilder('task')
      .leftJoin('task.creator', 'creator')
      .leftJoinAndSelect('task.completedDays', 'day')
      .addSelect('creator.id')
      .where('task.id = :id', { id });

    // Execute query and get result
    return query.getOne();
  }

  async create(user, taskDto) {
    // Get active days data
    const { activeDays } = taskDto;

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
      .reduce(
        (accum, dayEnabled, index) => accum + +dayEnabled * 2 ** index,
        0
      );

    // Define new task
    const task = {
      name: taskDto.name,
      description: taskDto.description,
      startDate: DateTime.fromJSDate(taskDto.startDate, {
        zone: 'utc',
      }).toSQLDate(),
      reminderTime: taskDto.reminderTime,
      daysToRepeat,
      creator: user,
    };

    // Persist task to database
    const { id } = await this.#repository.save(task);

    // Return the id of the newly created task
    return id;
  }

  async toggleForDay(task, day) {
    // Attempt to find day in relation data for task
    const matchingDay = await this.#repository
      .createQueryBuilder()
      .relation('completedDays')
      .of(task)
      .loadOne(day.id);

    // If day is present,
    if (matchingDay) {
      // Remove day from relation
      await this.#repository
        .createQueryBuilder()
        .relation('completedDays')
        .of(task)
        .remove(day);
    } else {
      // Otherwise, add day to relation
      await this.#repository
        .createQueryBuilder()
        .relation('completedDays')
        .of(task)
        .add(day);
    }
  }

  async update(task, taskDto) {
    // Get active days data
    const { activeDays } = taskDto;

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
      .reduce(
        (accum, dayEnabled, index) => accum + +dayEnabled * 2 ** index,
        0
      );

    // Preload task data
    const updatedTask = await this.#repository.preload({
      id: task.id,
      name: taskDto.name,
      description: taskDto.description,
      startDate: DateTime.fromJSDate(taskDto.startDate, {
        zone: 'utc',
      }).toSQLDate(),
      reminderTime: taskDto.reminderTime,
      daysToRepeat,
    });

    // Persist updated task to database
    await this.#repository.save(updatedTask);
  }

  async delete(task) {
    // Delete task
    await this.#repository.remove(task);
  }
}

// Exports
export default TaskService;
