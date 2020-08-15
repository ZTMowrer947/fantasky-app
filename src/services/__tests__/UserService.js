// Imports
import argon2 from 'argon2';
import { getConnection } from 'typeorm';

import UserService from '../UserService';
import { selectDatabaseEnvironment } from '../../bootstrapDatabase';
import UserSchema from '../../entities/UserSchema';

// Test Setup
function setupService() {
  // Retrieve database connection
  const connectionName = selectDatabaseEnvironment();
  const connection = getConnection(connectionName);

  // Get entity manager
  const { manager } = connection;

  // Initialize user service
  const service = new UserService(connection);

  // Return database connection and service
  return { manager, service };
}

// Test Suite
describe('User service', () => {
  describe('.getByEmail method', () => {
    it("should return a given user's data if one exists with the provided email address", async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get user repository
      const repository = manager.getRepository(UserSchema);

      // Define test user
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.tld',
        password: await argon2.hash('johnpassword'),
        dob: new Date('01/01/1970'),
      };

      // Persist user in database and retrieve ID
      const persistedUser = await repository.save(user);

      // Retrieve user from service
      const actualUser = await service.getByEmail(persistedUser.emailAddress);

      // Expect user retrieved from service to be defined
      expect(actualUser).toBeDefined();

      // Expect this user to include ID, full name, email, and dob fields
      expect(actualUser).toHaveProperty('id', persistedUser.id);
      expect(actualUser).toHaveProperty('firstName', persistedUser.firstName);
      expect(actualUser).toHaveProperty('lastName', persistedUser.lastName);
      expect(actualUser).toHaveProperty(
        'emailAddress',
        persistedUser.emailAddress
      );
      expect(actualUser).toHaveProperty('dob', persistedUser.dob);

      // Expect timestamp and password fields to be hidden
      expect(actualUser).not.toHaveProperty('createdAt');
      expect(actualUser).not.toHaveProperty('updatedAt');
      expect(actualUser).not.toHaveProperty('deletedAt');
      expect(actualUser).not.toHaveProperty('password');

      // Remove user from database
      await repository.remove(persistedUser);
    });

    it('should return undefined if no user exists with the given email address', async () => {
      // Setup service
      const { service } = setupService();

      // Define email address that is not tied to any user
      const emailAddress = 'void@example.tld';

      // Expect attempt to retrieve user by email address to return undefined
      await expect(service.getByEmail(emailAddress)).resolves.toBeUndefined();
    });
  });

  describe('.create method', () => {
    it('should create a user, making it retrievable by its email address', async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get user repository
      const repository = manager.getRepository(UserSchema);

      // Define user DTO
      const userDto = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.tld',
        password: 'johnpassword',
        dob: new Date('01/01/1970'),
      };

      // Use service to create new user
      await service.create(userDto);

      // Attempt to retrieve new user by email address, also selecting the password field
      const createdUser = await repository
        .createQueryBuilder('user')
        .where('user.emailAddress = :emailAddress', {
          emailAddress: userDto.emailAddress,
        })
        .addSelect('user.password')
        .getOne();

      // Expect user to be found
      expect(createdUser).toBeDefined();

      // Expect created user to match DTO data
      expect(createdUser).toHaveProperty('firstName', userDto.firstName);
      expect(createdUser).toHaveProperty('lastName', userDto.lastName);
      expect(createdUser).toHaveProperty('emailAddress', userDto.emailAddress);
      expect(createdUser).toHaveProperty('password');
      await expect(
        argon2.verify(createdUser.password, userDto.password)
      ).resolves.toBe(true);
      expect(createdUser).toHaveProperty('dob', userDto.dob);

      // Delete created user
      await repository.remove(createdUser);
    });
  });

  describe('.update method', () => {
    it("should update an existing user's data", async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get user repository
      const repository = manager.getRepository(UserSchema);

      // Define test user
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.tld',
        password: await argon2.hash('johnpassword'),
        dob: new Date('01/01/1970'),
      };

      // Persist user in database and retrieve ID
      const persistedUser = await repository.save(user);

      // Define update data
      const updateData = {
        firstName: 'Edith',
        lastName: 'Exampleton',
        emailAddress: 'edith@example.tld',
        password: 'edithpassword',
        dob: new Date('01/01/1975'),
      };

      // Update user using service
      await service.update(user, updateData);

      // Retrieve updated user by ID
      const updatedUser = await repository.findOne(persistedUser.id);

      // Expect user to match update data
      expect(updatedUser).toHaveProperty('firstName', updateData.firstName);
      expect(updatedUser).toHaveProperty('lastName', updatedUser.lastName);
      expect(updatedUser.dob.getTime()).toEqual(updatedUser.dob.getTime());
      expect(updatedUser).toHaveProperty(
        'emailAddress',
        updateData.emailAddress
      );

      // Delete user created for test
      await repository.remove(updatedUser);
    });
  });

  describe('.delete method', () => {
    it('should soft delete a user, making it irretrievable by email address but also recoverable', async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get user repository
      const repository = manager.getRepository(UserSchema);

      // Define test user
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.tld',
        password: await argon2.hash('johnpassword'),
        dob: new Date('01/01/1970'),
      };

      // Persist user in database and retrieve ID
      const persistedUser = await repository.save(user);

      // Delete user through service
      await service.delete(persistedUser);

      // Expect attempt to retrieve user again to result in undefined
      await expect(
        repository.findOne(persistedUser.id)
      ).resolves.toBeUndefined();

      // Recover user
      await repository.recover(persistedUser);

      // Expect attempt to retrieve user once again to succeed
      await expect(repository.findOne(persistedUser.id)).resolves.toBeDefined();

      // Hard-delete user
      await repository.remove(persistedUser);
    });
  });
});
