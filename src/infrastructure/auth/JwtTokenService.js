import jwt from "jsonwebtoken";

const DEFAULT_SECRET = "salary-mgmt-super-secret-key-998877";

export function createJwtTokenService(secret = process.env.JWT_SECRET || DEFAULT_SECRET) {
  /**
   * Generate a JWT payload for authenticated HR session
   * @param {Object} user - User metadata (id, username)
   * @param {string} expiresIn - Expiration string
   * @returns {string} Token
   */
  function generateToken(user, expiresIn = "8h") {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      secret,
      { expiresIn }
    );
  }

  /**
   * Decodes and validates the signature of incoming JWT tokens
   * @param {string} token - Signed JWT string
   * @returns {Object|null} Decoded payload or null if invalid
   */
  function verifyToken(token) {
    try {
      return jwt.verify(token, secret);
    } catch (err) {
      return null;
    }
  }

  return { generateToken, verifyToken };
}
export default createJwtTokenService;
