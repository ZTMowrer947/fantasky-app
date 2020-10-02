// Imports
import argon2 from 'argon2';
import { date, internet, name, random } from 'faker';
import { getConnection } from 'typeorm';

import TaskService from '../TaskService';
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

// Test helpers
async function createTestUser(userRepository) {
  // Generate random name for user
  const firstName = name.firstName();
  const lastName = name.lastName();

  // Generate random dob
  const dob = date.past(35, new Date('06/01/2005'));

  const dobString = dob.toISOString().slice(0, dob.toISOString().indexOf('T'));

  // Define user data
  const user = {
    firstName,
    lastName,
    emailAddress: internet.email(firstName, lastName),
    password: await argon2.hash(internet.password(24)),
    dob: dobString,
  };

  // Persist user to database
  return userRepository.save(user);
}

async function createTestTask(taskRepository, user) {
  // Define start date and convert to string
  const startDate = date.soon(64);

  const dateString = startDate
    .toISOString()
    .slice(0, startDate.toISOString().indexOf('T'));

  // Define test task
  const task = {
    name: random.words(3),
    description: null,
    daysToRepeat: 0b1111111,
    startDate: dateString,
    creator: user,
    completedDays: [],
  };

  // Persist task to database
  return taskRepository.save(task);
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

      // Create two test users
      const user1 = await createTestUser(userRepository);
      const user2 = await createTestUser(userRepository);

      // Create two tasks for each
      const user1Task1 = await createTestTask(taskRepository, user1);
      const user1Task2 = await createTestTask(taskRepository, user1);

      const user2Task1 = await createTestTask(taskRepository, user2);
      const user2Task2 = await createTestTask(taskRepository, user2);

      try {
        // Retrieve all the tasks for each user
        const user1RetrievedTasks = await service.findAllForUser(user1.id);
        const user2RetrievedTasks = await service.findAllForUser(user2.id);

        // Expect each to have returned 2 results
        expect(user1RetrievedTasks).toHaveLength(2);
        expect(user2RetrievedTasks).toHaveLength(2);

        // Expect each result to correspond with the ID of their respective task and creator
        expect(user1RetrievedTasks[0]).toHaveProperty('id', user1Task1.id);
        expect(user1RetrievedTasks[0].creator).toHaveProperty('id', user1.id);
        expect(user1RetrievedTasks[1]).toHaveProperty('id', user1Task2.id);
        expect(user1RetrievedTasks[1].creator).toHaveProperty('id', user1.id);

        expect(user2RetrievedTasks[0]).toHaveProperty('id', user2Task1.id);
        expect(user2RetrievedTasks[0].creator).toHaveProperty('id', user2.id);
        expect(user2RetrievedTasks[1]).toHaveProperty('id', user2Task2.id);
        expect(user2RetrievedTasks[1].creator).toHaveProperty('id', user2.id);
      } finally {
        // Remove all tasks
        await taskRepository.remove([
          user1Task1,
          user1Task2,
          user2Task1,
          user2Task2,
        ]);

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
      const user = await createTestUser(userRepository);

      // Define test task
      const task = await createTestTask(taskRepository, user);

      // Persist task to database
      const persistedTask = await taskRepository.save(task);

      try {
        // Attempt to retrieve task through service
        const retrievedTask = await service.findById(persistedTask.id);

        // Expect task to be defined
        expect(retrievedTask).toBeDefined();

        // Expect task data to match input data and have a valid task and creator id
        expect(retrievedTask).toHaveProperty('id', persistedTask.id);
        expect(retrievedTask).toHaveProperty('name', task.name);
        expect(retrievedTask).toHaveProperty('description', task.description);
        expect(retrievedTask).toHaveProperty('daysToRepeat', task.daysToRepeat);
        expect(retrievedTask).toHaveProperty('startDate', task.startDate);
        expect(retrievedTask.creator).toBeDefined();
        expect(retrievedTask.creator).toHaveProperty('id', task.creator.id);
      } finally {
        // Remove test task and user
        await taskRepository.remove(persistedTask);
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
