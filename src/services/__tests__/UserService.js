// Imports
import argon2 from 'argon2';
import { getConnection } from 'typeorm';

import { generateFakeUser, generateFakeUserDto } from '@/__testutils__/users';
import { selectDatabaseEnvironment } from '@/bootstrapDatabase';
import User from '@/entities/User';
import UserService from '@/services/UserService';

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
      const repository = manager.getRepository(User);

      // Create test user
      const user = generateFakeUser();

      // Persist user in database and retrieve ID
      const { id } = await repository.save(user);

      // Attach id to user
      user.id = id;

      try {
        // Define incorrect password
        const password = 'wrongpassword';

        // Expect credential verification to fail
        await expect(
          service.verifyCredentials(user.emailAddress, password)
        ).resolves.toBeFalsy();
      } finally {
        // Remove persisted user
        await repository.remove(user);
      }
    });

    it("should return true if the credentials match a user's data", async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get user repository
      const repository = manager.getRepository(User);

      // Create test user
      const user = generateFakeUser();

      // Store password before hashing
      const { password } = user;

      // Persist user in database and retrieve ID
      const { id } = await repository.save(user);

      // Attach id to user
      user.id = id;

      try {
        // Expect credential verification to succeed
        await expect(
          service.verifyCredentials(user.emailAddress, password)
        ).resolves.toBeTruthy();
      } finally {
        // Remove persisted user
        await repository.remove(user);
      }
    });
  });

  describe('.getByEmail method', () => {
    it("should return a given user's data if one exists with the provided email address", async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get user repository
      const repository = manager.getRepository(User);

      // Create test user
      const user = generateFakeUser();

      // Persist user in database and retrieve ID
      const { id } = await repository.save(user);

      // Attach id to user
      user.id = id;

      try {
        // Retrieve user from service
        const actualUser = await service.getByEmail(user.emailAddress);

        // Expect user retrieved from service to be defined
        expect(actualUser).toBeDefined();

        // Expect this user to include ID, full name, email, and dob fields
        expect(actualUser).toHaveProperty('id', id);
        expect(actualUser).toHaveProperty('firstName', user.firstName);
        expect(actualUser).toHaveProperty('lastName', user.lastName);
        expect(actualUser).toHaveProperty('emailAddress', user.emailAddress);
        expect(actualUser).toHaveProperty('dob', user.dob);

        // Expect timestamp and password fields to be hidden
        expect(actualUser).not.toHaveProperty('createdAt');
        expect(actualUser).not.toHaveProperty('updatedAt');
        expect(actualUser).not.toHaveProperty('deletedAt');
        expect(actualUser).not.toHaveProperty('password');
      } finally {
        // Remove user from database
        await repository.remove(user);
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
      const repository = manager.getRepository(User);

      // Define user DTO
      const userDto = generateFakeUserDto();

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
      const repository = manager.getRepository(User);

      // Create test user
      const user = generateFakeUser();

      // Persist user in database and retrieve ID
      const { id } = await repository.save(user);

      // Attach ID to user
      user.id = id;

      try {
        // Define update data
        const updateDto = generateFakeUserDto();

        // Update user using service
        await service.update(user, updateDto);

        // Retrieve updated user by ID
        const updatedUser = await repository.findOne(user.id);

        // Expect user to match update data
        expect(updatedUser).toHaveProperty('firstName', updateDto.firstName);
        expect(updatedUser).toHaveProperty('lastName', updateDto.lastName);
        expect(updatedUser).toHaveProperty('dob', updateDto.dob);
        expect(updatedUser).toHaveProperty(
          'emailAddress',
          updateDto.emailAddress
        );
      } finally {
        // Delete user created for test
        await repository.remove(user);
      }
    });
  });

  describe('.delete method', () => {
    it('should soft delete a user, making it irretrievable by email address but also recoverable', async () => {
      // Setup service
      const { manager, service } = setupService();

      // Get user repository
      const repository = manager.getRepository(User);

      // Create test user
      const user = generateFakeUser();

      // Persist user in database and retrieve ID
      const { id } = await repository.save(user);

      // Attach ID to user
      user.id = id;

      try {
        // Delete user through service
        await service.delete(user);

        // Expect attempt to retrieve user again to result in undefined
        await expect(repository.findOne(id)).resolves.toBeUndefined();

        // Recover user
        await repository.recover(user);

        // Expect attempt to retrieve user once again to succeed
        await expect(repository.findOne(id)).resolves.toBeDefined();
      } finally {
        // Hard-delete user
        await repository.remove(user);
      }
    });
  });
});
