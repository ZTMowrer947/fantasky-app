// Imports
import UserSchema from '../entities/UserSchema';

// Service
class TokenService {
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

  async verifyPayload(payload) {
    // Create query to get last modification date
    const query = this.#repository
      .createQueryBuilder('user')
      .select('user.updatedAt', 'updatedAt')
      .where('user.id = :id', { id: payload.userid });

    // Execute query and get raw data
    const queryResult = await query.getRawOne();

    // If user could not be found, the token is invalid
    if (!queryResult) return false;

    // If user exists, extract the date of its last modification
    const updatedAt = new Date(queryResult.updatedAt);

    // Convert last modification date into JWT NumericDate format
    const numericUpdatedAtDate = Math.trunc(updatedAt.getTime() / 1000);

    // If user has been updated since the token was issued, the token is invalid
    if (numericUpdatedAtDate > payload.iat) return false;

    // Otherwise, the token is valid
    return true;
  }
}

// Exports
export default TokenService;
