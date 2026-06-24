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

// Functional interfaces do not require class-based abstraction definitions in JavaScript.
// See JSDoc annotations above for the repository contract.

