// Imports
import { DateTime } from 'luxon';
import { getConnection } from 'typeorm';

import TaskService from '../TaskService';
import { generateFakeDay } from '../../__testutils__/day';
import { generateFakeTask } from '../../__testutils__/tasks';
import { generateFakeUser } from '../../__testutils__/users';
import { selectDatabaseEnvironment } from '../../bootstrapDatabase';
import Day from '../../entities/Day';
import Task from '../../entities/Task';
import User from '../../entities/User';

// Test Setup
function setupService() {
  // Retrieve database connection
  const connectionName = selectDatabaseEnvironment();
  const connection = getConnection(connectionName);

  // Get entity manager
  const { manager } = connection;

  // Initialize user service
  const service = new TaskService(connection);

  // Return database connection and service
  return { manager, service };
}

// Test Suite
describe('Task service', () => {
  describe('.findAllForUser method', () => {
    it("should retrieve all the tasks for a given user, and nobody else's", async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get task and user repositories
      const taskRepository = manager.getRepository(Task);
      const userRepository = manager.getRepository(User);

      // Define data for two test users
      const user1Data = await generateFakeUser();
      const user2Data = await generateFakeUser();

      // Persist the two users
      const [user1, user2] = await userRepository.save([user1Data, user2Data]);

      // Define two tasks for each
      const task1AData = generateFakeTask(user1);
      const task1BData = generateFakeTask(user1);

      const task2AData = generateFakeTask(user2);
      const task2BData = generateFakeTask(user2);

      // Persist each of the tasks
      const [task1A, task1B] = await taskRepository.save([
        task1AData,
        task1BData,
      ]);
      const [task2A, task2B] = await taskRepository.save([
        task2AData,
        task2BData,
      ]);

      try {
        // Retrieve all the tasks for each user
        const user1RetrievedTasks = await service.findAllForUser(user1.id);
        const user2RetrievedTasks = await service.findAllForUser(user2.id);

        // Expect each to have returned 2 results
        expect(user1RetrievedTasks).toHaveLength(2);
        expect(user2RetrievedTasks).toHaveLength(2);

        // Expect each result to correspond with the ID of their respective task and creator
        expect(user1RetrievedTasks[0]).toHaveProperty('id', task1A.id);
        expect(user1RetrievedTasks[0].creator).toHaveProperty('id', user1.id);
        expect(user1RetrievedTasks[1]).toHaveProperty('id', task1B.id);
        expect(user1RetrievedTasks[1].creator).toHaveProperty('id', user1.id);

        expect(user2RetrievedTasks[0]).toHaveProperty('id', task2A.id);
        expect(user2RetrievedTasks[0].creator).toHaveProperty('id', user2.id);
        expect(user2RetrievedTasks[1]).toHaveProperty('id', task2B.id);
        expect(user2RetrievedTasks[1].creator).toHaveProperty('id', user2.id);
      } finally {
        // Remove all tasks
        await taskRepository.remove([task1A, task1B, task2A, task2B]);

        // Remove both users
        await userRepository.remove([user1, user2]);
      }
    });
  });

  describe('.findById method', () => {
    it('should retrieve a task by its id if one can be found', async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get task and user repositories
      const taskRepository = manager.getRepository(Task);
      const userRepository = manager.getRepository(User);

      // Create test user
      const userData = await generateFakeUser();
      const user = await userRepository.save(userData);

      // Create test task belonging to user
      const taskData = generateFakeTask(user);
      const task = await taskRepository.save(taskData);

      try {
        // Attempt to retrieve task through service
        const retrievedTask = await service.findById(task.id);

        // Expect task to be defined
        expect(retrievedTask).toBeDefined();

        // Expect task data to match input data and have a valid task and creator id
        expect(retrievedTask).toHaveProperty('id', task.id);
        expect(retrievedTask).toHaveProperty('name', task.name);
        expect(retrievedTask).toHaveProperty('description', task.description);
        expect(retrievedTask).toHaveProperty('daysToRepeat', task.daysToRepeat);
        expect(retrievedTask).toHaveProperty('startDate', task.startDate);
        expect(retrievedTask.creator).toBeDefined();
        expect(retrievedTask.creator).toHaveProperty('id', task.creator.id);
      } finally {
        // Remove test task and user
        await taskRepository.remove(task);
        await userRepository.remove(user);
      }
    });

    it('should return undefined if no task exists with the given id', async () => {
      // Setup service
      const { service } = setupService();

      // Define id of task that should not exist
      const id = Number.MAX_SAFE_INTEGER;

      // Expect that attempt to retrieve task by id yields undefined
      await expect(service.findById(id)).resolves.toBeUndefined();
    });
  });

  describe('.create method', () => {
    it('should create a new task', async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get task and user repositories
      const taskRepository = manager.getRepository(Task);
      const userRepository = manager.getRepository(User);

      // Create test user
      const userData = await generateFakeUser();
      const user = await userRepository.save(userData);

      try {
        // Generate test task data
        const { name, description, reminderTime, startDate } = generateFakeTask(
          user
        );

        // Define task DTO from data
        const taskDto = {
          name,
          description,
          reminderTime,
          startDate,
          activeDays: {
            sun: true,
            mon: true,
            tue: true,
            wed: true,
            thu: true,
            fri: true,
            sat: true,
          },
        };

        // Define expected daysToRepeat and startDate values
        const expectedDaysToRepeat = 0b1111111;
        const expectedStartDate = DateTime.fromJSDate(taskDto.startDate, {
          zone: 'utc',
        }).toSQLDate();

        // Create task and get ID
        const id = await service.create(user, taskDto);

        // Attempt to retrieve task by ID
        const retrievedTask = await taskRepository.findOne(id, {
          relations: ['creator'],
        });

        // Expect task to be defined and to match DTO data
        expect(retrievedTask).toBeDefined();
        expect(retrievedTask).toHaveProperty('name', taskDto.name);
        expect(retrievedTask).toHaveProperty(
          'description',
          taskDto.description
        );
        expect(retrievedTask).toHaveProperty(
          'reminderTime',
          taskDto.reminderTime
        );
        expect(retrievedTask).toHaveProperty('startDate', expectedStartDate);
        expect(retrievedTask).toHaveProperty(
          'daysToRepeat',
          expectedDaysToRepeat
        );
      } finally {
        // Remove test user and associated tasks
        await userRepository.remove(user);
      }
    });
  });

  describe('.toggleForDay method', () => {
    it('should mark the task as completed for a day if not already so', async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get task, user, and day repositories
      const taskRepository = manager.getRepository(Task);
      const userRepository = manager.getRepository(User);
      const dayRepository = manager.getRepository(Day);

      // Create test user
      const userData = await generateFakeUser();
      const user = await userRepository.save(userData);

      // Create test task belonging to user
      const taskData = generateFakeTask(user);
      const task = await taskRepository.save(taskData);

      // Create day to attach to task
      const dayData = generateFakeDay();
      const day = await dayRepository.save(dayData);

      try {
        // Mark task for day
        await service.toggleForDay(task, day);

        // Query relation for newly attached day
        const attachedDay = await taskRepository
          .createQueryBuilder()
          .relation('completedDays')
          .of(task)
          .loadOne(day.id);

        // Expect day to be found
        expect(attachedDay).toBeDefined();
      } finally {
        // Remove test data
        await dayRepository.remove(day);
        await taskRepository.remove(task);
        await userRepository.remove(user);
      }
    });

    it('should unmark the task as completed if already so', async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get task, user, and day repositories
      const taskRepository = manager.getRepository(Task);
      const userRepository = manager.getRepository(User);
      const dayRepository = manager.getRepository(Day);

      // Create test user
      const userData = await generateFakeUser();
      const user = await userRepository.save(userData);

      // Create day to attach to task
      const dayData = generateFakeDay();
      const day = await dayRepository.save(dayData);

      // Create test task belonging to user and having day attached
      const taskData = generateFakeTask(user);
      taskData.completedDays.push(day);
      const task = await taskRepository.save(taskData);

      try {
        // Unmark task for day
        await service.toggleForDay(task, day);

        // Query relation for newly attached day
        const attachedDay = await taskRepository
          .createQueryBuilder()
          .relation('completedDays')
          .of(task)
          .loadOne(day.id);

        // Expect day to not be found
        expect(attachedDay).toBeUndefined();
      } finally {
        // Remove test data
        await dayRepository.remove(day);
        await taskRepository.remove(task);
        await userRepository.remove(user);
      }
    });
  });

  describe('.update method', () => {
    it('should update existing task data', async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get task and user repositories
      const taskRepository = manager.getRepository(Task);
      const userRepository = manager.getRepository(User);

      // Create test user
      const userData = await generateFakeUser();
      const user = await userRepository.save(userData);

      // Create test task belonging to user
      const taskData = generateFakeTask(user);
      const task = await taskRepository.save(taskData);

      try {
        // Generate new task data
        // Generate test task data
        const { name, description, reminderTime, startDate } = generateFakeTask(
          user
        );

        // Define task DTO from data
        const taskDto = {
          name,
          description,
          reminderTime,
          startDate,
          activeDays: {
            sun: false,
            mon: true,
            tue: true,
            wed: true,
            thu: true,
            fri: false,
            sat: false,
          },
        };

        // Define expected daysToRepeat and startDate values
        const expectedDaysToRepeat = 0b0111100;
        const expectedStartDate = DateTime.fromJSDate(taskDto.startDate, {
          zone: 'utc',
        }).toSQLDate();

        // Update task using service
        await service.update(task, taskDto);

        // Retrieve updated task by id
        const updatedTask = await taskRepository.findOne(task.id);

        // Expect task to match update data
        expect(updatedTask).toHaveProperty('name', taskDto.name);
        expect(updatedTask).toHaveProperty('description', taskDto.description);
        expect(updatedTask).toHaveProperty(
          'reminderTime',
          taskDto.reminderTime
        );
        expect(updatedTask).toHaveProperty('startDate', expectedStartDate);
        expect(updatedTask).toHaveProperty(
          'daysToRepeat',
          expectedDaysToRepeat
        );
      } finally {
        // Remove test task and user
        await taskRepository.remove(task);
        await userRepository.remove(user);
      }
    });
  });

  describe('.delete method', () => {
    it('should irrecoverably delete a task', async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get task and user repositories
      const taskRepository = manager.getRepository(Task);
      const userRepository = manager.getRepository(User);

      // Create test user
      const userData = await generateFakeUser();
      const user = await userRepository.save(userData);

      // Create test task belonging to user
      const taskData = generateFakeTask(user);
      const task = await taskRepository.save(taskData);

      try {
        // Extract id from task
        const { id } = task;

        // Attempt to delete task through service
        await service.delete(task);

        // Expect attempts to recover deleted task to fail
        await expect(taskRepository.findOneOrFail(id)).rejects.toThrow();
      } finally {
        // Remove test user
        await userRepository.remove(user);
      }
    });
  });
});
