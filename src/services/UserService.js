// Imports
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
    // Define new user
    const user = {
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      emailAddress: userDto.emailAddress,
      password: userDto.password,
      dob: userDto.dob,
    };

    // Persist user to database
    await this.#repository.save(user);
  }

  async update(user, updateDto) {
    // Preload user data
    const updatedUser = await this.#repository.preload({
      id: user.id,
      firstName: updateDto.firstName,
      lastName: updateDto.lastName,
      emailAddress: updateDto.emailAddress,
      password: updateDto.password,
      dob: updateDto.dob,
    });

    // If user was not found, throw error
    if (!updatedUser) {
      throw new Error(`Could not find user with ID "${user.id}"`);
    }

    // Otherwise, persist updated user to database
    await this.#repository.save(updatedUser);
  }

  async delete(user) {
    // Create deletion query
    const query = this.#repository
      .createQueryBuilder('user')
      .softDelete()
      .where('user.id = :id', { id: user.id });

    // Execute query
    await query.execute();
  }
}

// Exports
export default UserService;
