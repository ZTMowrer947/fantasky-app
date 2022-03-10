// Imports
import { classToClass } from 'class-transformer';
import { Connection, Repository } from 'typeorm';

import UpsertTaskDto from '@/dto/UpsertTaskDto';
import Day from '@/entities/Day';
import Task from '@/entities/Task';
import User from '@/entities/User';

// Service
class TaskService {
  #taskRepository: Repository<Task>;

  constructor(connection: Connection) {
    this.#taskRepository = connection.getRepository(Task);
  }

  async findAllForUser(userId: number): Promise<Task[]> {
    // Create query for task
    const query = this.#taskRepository
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
    const query = this.#taskRepository
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
    const { id } = await this.#taskRepository.save(task);

    // Return the id of the newly created task
    return id;
  }

  async toggleForDay(task: Task, day: Day): Promise<void> {
    const taskCopy = classToClass(task);

    // Attempt to find day in relation data for task
    const taskMarkedForDay = taskCopy.completedDays.find(
      (completedDay) => completedDay.id === day.id
    );

    // If day is present,
    if (taskMarkedForDay) {
      // Remove day from relation
      taskCopy.completedDays = taskCopy.completedDays.filter(
        (completedDay) => completedDay.id !== day.id
      );

      await this.#taskRepository.save(taskCopy);
    } else {
      // Otherwise, add day to relation
      taskCopy.completedDays.push(day);

      await this.#taskRepository.save(taskCopy);
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
    const updatedTask = await this.#taskRepository.preload({
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
    await this.#taskRepository.save(updatedTask);
  }

  async delete(task: Task): Promise<void> {
    // Delete task
    await this.#taskRepository.remove(task);
  }
}

// Exports
export default TaskService;
