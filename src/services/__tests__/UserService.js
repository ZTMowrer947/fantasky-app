// Imports
import argon2 from 'argon2';
import { getConnection } from 'typeorm';

import UserService from '../UserService';
import { generateFakeUser } from '../../__testutils__/users';
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
  describe('.verifyCredentials method', () => {
    it('should return false if no user exists with the given email address', async () => {
      // Setup service
      const { service } = setupService();

      // Define email and password of nonexistent user
      const emailAddress = 'wdgaster@void.ut';
      const password = '';

      // Expect credential verification to fail
      await expect(
        service.verifyCredentials(emailAddress, password)
      ).resolves.toBeFalsy();
    });

    it('should return false if the password is incorrect', async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get user repository
      const repository = manager.getRepository(UserSchema);

      // Create test user
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.tld',
        password: await argon2.hash('johnpassword'),
        dob: '1970-01-01',
      };

      // Persist user in database and retrieve ID
      const persistedUser = await repository.save(userData);
      try {
        // Define incorrect password
        const password = 'wrongpassword';

        // Expect credential verification to fail
        await expect(
          service.verifyCredentials(persistedUser.emailAddress, password)
        ).resolves.toBeFalsy();
      } finally {
        // Remove persisted user
        await repository.remove(persistedUser);
      }
    });

    it("should return true if the credentials match a user's data", async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get user repository
      const repository = manager.getRepository(UserSchema);

      // Define password and test user
      const password = 'johnpassword';
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.tld',
        password: await argon2.hash(password),
        dob: '1970-01-01',
      };

      // Persist user in database and retrieve ID
      const persistedUser = await repository.save(userData);

      try {
        // Expect credential verification to succeed
        await expect(
          service.verifyCredentials(persistedUser.emailAddress, password)
        ).resolves.toBeTruthy();
      } finally {
        // Remove persisted user
        await repository.remove(persistedUser);
      }
    });
  });

  describe('.getByEmail method', () => {
    it("should return a given user's data if one exists with the provided email address", async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get user repository
      const repository = manager.getRepository(UserSchema);

      // Define test user
      const userData = await generateFakeUser();

      // Persist user in database and retrieve ID
      const persistedUser = await repository.save(userData);

      try {
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
      } finally {
        // Remove user from database
        await repository.remove(persistedUser);
      }
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
        dob: '1970-01-01',
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

      try {
        // Expect created user to match DTO data
        expect(createdUser).toHaveProperty('firstName', userDto.firstName);
        expect(createdUser).toHaveProperty('lastName', userDto.lastName);
        expect(createdUser).toHaveProperty(
          'emailAddress',
          userDto.emailAddress
        );
        expect(createdUser).toHaveProperty('password');
        await expect(
          argon2.verify(createdUser.password, userDto.password)
        ).resolves.toBe(true);
        expect(createdUser).toHaveProperty('dob', userDto.dob);
      } finally {
        // Delete created user
        await repository.remove(createdUser);
      }
    });
  });

  describe('.update method', () => {
    it("should update an existing user's data", async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get user repository
      const repository = manager.getRepository(UserSchema);

      // Define test user
      const userData = await generateFakeUser();

      // Persist user in database and retrieve ID
      const persistedUser = await repository.save(userData);

      try {
        // Define update data
        const updateData = {
          firstName: 'Edith',
          lastName: 'Exampleton',
          emailAddress: 'edith@example.tld',
          password: 'edithpassword',
          dob: '1975-01-01',
        };

        // Update user using service
        await service.update(persistedUser, updateData);

        // Retrieve updated user by ID
        const updatedUser = await repository.findOne(persistedUser.id);

        // Expect user to match update data
        expect(updatedUser).toHaveProperty('firstName', updateData.firstName);
        expect(updatedUser).toHaveProperty('lastName', updatedUser.lastName);
        expect(updatedUser.dob).toEqual(updatedUser.dob);
        expect(updatedUser).toHaveProperty(
          'emailAddress',
          updateData.emailAddress
        );
      } finally {
        // Delete user created for test
        await repository.remove(persistedUser);
      }
    });
  });

  describe('.delete method', () => {
    it('should soft delete a user, making it irretrievable by email address but also recoverable', async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get user repository
      const repository = manager.getRepository(UserSchema);

      // Define test user
      const userData = await generateFakeUser();

      // Persist user in database and retrieve ID
      const persistedUser = await repository.save(userData);

      try {
        // Delete user through service
        await service.delete(persistedUser);

        // Expect attempt to retrieve user again to result in undefined
        await expect(
          repository.findOne(persistedUser.id)
        ).resolves.toBeUndefined();

        // Recover user
        await repository.recover(persistedUser);

        // Expect attempt to retrieve user once again to succeed
        await expect(
          repository.findOne(persistedUser.id)
        ).resolves.toBeDefined();
      } finally {
        // Hard-delete user
        await repository.remove(persistedUser);
      }
    });
  });
});
