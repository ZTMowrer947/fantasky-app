// Imports
import { Connection, Repository } from 'typeorm';

import Task from '@/entities/Task';
import User from '@/entities/User';
import UpsertTaskDto from '@/dto/UpsertTaskDto';
import Day from '@/entities/Day';

// Service
class TaskService {
  #repository: Repository<Task>;

  constructor(connection: Connection) {
    this.#repository = connection.getRepository(Task);
  }

  async findAllForUser(userId: number): Promise<Task[]> {
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

  async findById(id: number): Promise<Task | undefined> {
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

  async create(user: User, taskDto: UpsertTaskDto): Promise<number> {
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
    const task = new Task();
    task.name = taskDto.name;
    task.description = taskDto.description;
    task.startDate = taskDto.startDate;
    task.reminderTime = taskDto.reminderTime;
    task.daysToRepeat = daysToRepeat;
    task.creator = user;

    // Persist task to database
    const { id } = await this.#repository.save(task);

    // Return the id of the newly created task
    return id;
  }

  async toggleForDay(task: Task, day: Day): Promise<void> {
    // Attempt to find day in relation data for task
    const matchingDay = await this.#repository.manager
      .createQueryBuilder(Day, 'day')
      .innerJoin('day.tasksCompleted', 'task')
      .where('task.id = :taskId', { taskId: task.id })
      .andWhere('day.id = :dayId', { dayId: day.id })
      .getOne();

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

  async update(task: Task, taskDto: UpsertTaskDto): Promise<void> {
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
      startDate: taskDto.startDate,
      reminderTime: taskDto.reminderTime,
      daysToRepeat,
    });

    // If preloaded task is not defined, throw error
    if (!updatedTask)
      throw new Error(`Task with id "${task.id}" does not exist`);

    // Persist updated task to database
    await this.#repository.save(updatedTask);
  }

  async delete(task: Task): Promise<void> {
    // Delete task
    await this.#repository.remove(task);
  }
}

// Exports
export default TaskService;
