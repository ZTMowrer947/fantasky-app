// Imports
import { getConnection } from 'typeorm';

import TaskService from '../TaskService';
import { generateFakeTask } from '../../__testutils__/tasks';
import { generateFakeUser } from '../../__testutils__/users';
import { selectDatabaseEnvironment } from '../../bootstrapDatabase';
import TaskSchema from '../../entities/TaskSchema';
import UserSchema from '../../entities/UserSchema';

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
      const taskRepository = manager.getRepository(TaskSchema);
      const userRepository = manager.getRepository(UserSchema);

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
      const taskRepository = manager.getRepository(TaskSchema);
      const userRepository = manager.getRepository(UserSchema);

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
});
