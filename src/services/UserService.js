// Imports
import argon2 from 'argon2';
import os from 'os';

import UserSchema from '../entities/UserSchema';

// Service
class UserService {
  /**
   * @type {import("typeorm").Repository}
   */
  #repository;

  /**
   * @param {import("typeorm").Connection} connection
   */
  constructor(connection) {
    this.#repository = connection.getRepository(UserSchema);
  }

  /**
   * @param {string} emailAddress
   */
  async getByEmail(emailAddress) {
    // Create query for user
    const query = this.#repository
      .createQueryBuilder('user')
      .where('user.emailAddress = :emailAddress', { emailAddress });

    // Execute query and return result
    return query.getOne();
  }

  async create(userDto) {
    // Hash password
    const passwordHash = await argon2.hash(userDto.password, {
      hashLength: 48,
      parallelism: os.cpus().length,
      memoryCost: 2 ** 16,
      timeCost: 10,
    });

    // Define new user
    const user = {
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      emailAddress: userDto.emailAddress,
      password: passwordHash,
      dob: userDto.dob,
    };

    // Persist user to database
    await this.#repository.save(user);
  }

  async update(user, updateDto) {
    // Hash new password
    const passwordHash = await argon2.hash(updateDto.password, {
      hashLength: 48,
      parallelism: os.cpus().length,
      memoryCost: 2 ** 16,
      timeCost: 10,
    });

    // Preload user data
    const updatedUser = await this.#repository.preload({
      id: user.id,
      firstName: updateDto.firstName,
      lastName: updateDto.lastName,
      emailAddress: updateDto.emailAddress,
      password: passwordHash,
      dob: updateDto.dob,
    });

    // Otherwise, persist updated user to database
    await this.#repository.save(updatedUser);
  }

  async delete(user) {
    // Soft-delete user
    await this.#repository.softRemove(user);
  }
}

// Exports
export default UserService;
