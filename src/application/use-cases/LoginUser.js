import bcrypt from "bcryptjs";

/**
 * Use Case: LoginUser
 * Authenticates HR administrator credentials and creates a JWT.
 */
export function createLoginUser(userRepository, tokenService) {
  /**
   * Execute usecase logic
   * @param {string} username - User input username
   * @param {string} password - User input plain password
   * @returns {Promise<{ user: Object, token: string }>} Signed session details
   * @throws {Error} if credentials do not match
   */
  async function execute(username, password) {
    if (!username || !password) {
      const missingErr = new Error("Username and password are required");
      missingErr.statusCode = 400;
      throw missingErr;
    }

    // 1. Fetch user by username
    const user = await userRepository.findByUsername(username);
    if (!user) {
      const authErr = new Error("Invalid username or password");
      authErr.statusCode = 401;
      throw authErr;
    }

    // 2. Compare password hashes
    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      const authErr = new Error("Invalid username or password");
      authErr.statusCode = 401;
      throw authErr;
    }

    // 3. Issue Token
    const cleanUser = { id: user.id, username: user.username };
    const token = tokenService.generateToken(cleanUser);

    return {
      user: cleanUser,
      token,
    };
  }

  return { execute };
}
export default createLoginUser;
