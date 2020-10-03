// Imports
import TaskSchema from '../entities/TaskSchema';

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
    this.#repository = connection.getRepository(TaskSchema);
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
    // Convert repeating days to database format
    const daysToRepeat = [
      taskDto.sun,
      taskDto.mon,
      taskDto.tue,
      taskDto.wed,
      taskDto.thu,
      taskDto.fri,
      taskDto.sat,
    ].reduce((accum, dayEnabled, index) => accum + +dayEnabled * 2 ** index, 0);

    // Define new task
    const task = {
      name: taskDto.name,
      description: taskDto.description,
      startDate: taskDto.startDate,
      reminderTime: taskDto.reminderTime,
      daysToRepeat,
      creator: user,
    };

    // Persist task to database
    await this.#repository.save(task);
  }

  // async markForDay(task, day) {}

  // async update(task, taskData) {}

  async delete(task) {
    // Delete task
    await this.#repository.remove(task);
  }
}

// Exports
export default TaskService;
