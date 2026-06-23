import jwt from "jsonwebtoken";

const DEFAULT_SECRET = "salary-mgmt-super-secret-key-998877";

export class JwtTokenService {
  constructor(secret = process.env.JWT_SECRET || DEFAULT_SECRET) {
    this.secret = secret;
  }

  /**
   * Generate a JWT payload for authenticated HR session
   * @param {Object} user - User metadata (id, username)
   * @param {string} expiresIn - Expiration string
   * @returns {string} Token
   */
  generateToken(user, expiresIn = "8h") {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      this.secret,
      { expiresIn }
    );
  }

  /**
   * Decodes and validates the signature of incoming JWT tokens
   * @param {string} token - Signed JWT string
   * @returns {Object|null} Decoded payload or null if invalid
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (err) {
      return null;
    }
  }
}
export default JwtTokenService;
