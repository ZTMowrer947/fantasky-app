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

  // async findAllForUser(userId) {}

  async findById(id) {
    // Create query for task
    const query = this.#repository
      .createQueryBuilder('task')
      .leftJoin('task.creator', 'user')
      .leftJoinAndSelect('task.completedDays', 'day')
      .addSelect('user.id')
      .where('task.id = :id', { id });

    // Execute query and get result
    return query.getOne();
  }

  // async create(taskData) {}

  // async markForDay(task, day) {}

  // async update(task, taskData) {}

  // async delete(task) {}
}

// Exports
export default TaskService;
