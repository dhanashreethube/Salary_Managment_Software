/**
 * IUserRepository Interface Definition (JSDoc)
 * This outlines the contract for administrative user repository operations.
 * 
 * @interface IUserRepository
 */

/**
 * Find user records for authentication matching active username
 * @function
 * @name IUserRepository#findByUsername
 * @param {string} username - Target login name
 * @returns {Promise<Object|null>} Match user object or null
 */

/**
 * Create or update user profiles
 * @function
 * @name IUserRepository#save
 * @param {Object} user - User record (id, username, passwordHash)
 * @returns {Promise<Object>} Created user record
 */

export class IUserRepository {
  constructor() {
    if (new.target === IUserRepository) {
      throw new TypeError("Cannot construct IUserRepository instances directly");
    }
  }

  async findByUsername(username) { throw new Error("Method not implemented"); }
  async save(user) { throw new Error("Method not implemented"); }
}
