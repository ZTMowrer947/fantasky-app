// Imports
import argon2 from 'argon2';
import { Connection, Repository } from 'typeorm';

import UpsertUserDto from '@/dto/UpsertUserDto';
import User from '@/entities/User';

// Service
class UserService {
  #repository: Repository<User>;

  constructor(connection: Connection) {
    this.#repository = connection.getRepository(User);
  }

  async verifyCredentials(
    emailAddress: string,
    password: string
  ): Promise<boolean> {
    // Create query for password hash of user with given email
    const query = this.#repository
      .createQueryBuilder('user')
      .select('user.password', 'password')
      .where('user.emailAddress = :emailAddress', { emailAddress });

    // Execute query and return raw data
    const userData = await query.getRawOne<Pick<User, 'password'>>();

    // If no user exists with the given email, return false
    if (!userData) return false;

    // Otherwise, verify that given password matches database hash
    return argon2.verify(userData.password, password);
  }

  async getByEmail(emailAddress: string): Promise<User | undefined> {
    // Create query for user
    const query = this.#repository
      .createQueryBuilder('user')
      .where('user.emailAddress = :emailAddress', { emailAddress });

    // Execute query and return result
    return query.getOne();
  }

  async create(userDto: UpsertUserDto): Promise<void> {
    // Define new user
    const user = new User();
    user.firstName = userDto.firstName;
    user.lastName = userDto.lastName;
    user.emailAddress = userDto.emailAddress;
    user.password = userDto.password;
    user.dob = userDto.dob;

    // Persist user to database
    await this.#repository.save(user);
  }

  async update(user: User, updateDto: UpsertUserDto): Promise<void> {
    // Preload user data
    const updatedUser = await this.#repository.preload({
      id: user.id,
      firstName: updateDto.firstName,
      lastName: updateDto.lastName,
      emailAddress: updateDto.emailAddress,
      password: updateDto.password,
      dob: updateDto.dob,
    });

    // If user does not exist, throw error
    if (!updatedUser)
      throw new Error(`User with ID "${user.id} does not exist"`);

    // Otherwise, persist updated user to database
    await this.#repository.save(updatedUser);
  }

  async delete(user: User): Promise<void> {
    // Soft-delete user
    await this.#repository.softRemove(user);
  }
}

// Exports
export default UserService;
