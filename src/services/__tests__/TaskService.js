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

async function setupUser(repository) {
  // Generate random name for user
  const firstName = name.firstName();
  const lastName = name.lastName();

  // Define user data
  const user = {
    firstName,
    lastName,
    emailAddress: internet.email(firstName, lastName),
    password: await argon2.hash(internet.password(24)),
    dob: date.past(50),
  };

  // Persist user to database
  return repository.save(user);
}

async function tearDownUser(repository, user) {
  await repository.remove(user);
}

// Test Suite
describe('Task service', () => {
  describe('.findById method', () => {
    it('should retrieve a task by its id if one can be found', async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get user repository
      const taskRepository = manager.getRepository(TaskSchema);
      const userRepository = manager.getRepository(UserSchema);

      // Create test user
      const user = await setupUser(userRepository);

      // Define test task
      const task = {
        name: random.words(3),
        description: null,
        daysToRepeat: 0b1111111,
        startDate: date.soon(64),
        creator: user,
        completedDays: [],
      };

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
        // Remove test task from database
        await taskRepository.remove(persistedTask);

        // Remove test user
        await tearDownUser(userRepository, user);
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
