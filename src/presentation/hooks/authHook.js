import { createJwtTokenService } from "../../infrastructure/auth/JwtTokenService.js";

const tokenService = createJwtTokenService();

/**
 * Fastify preHandler hook to guard authenticated routes.
 * Inspects cookies or Authorization headers for JWT signatures.
 */
export async function authHook(request, reply) {
  let token = null;

  // 1. Try to fetch token from Authorization Bearer header
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. Fallback to parsing cookies if present
  if (!token && request.cookies) {
    token = request.cookies.token;
  }

  if (!token) {
    reply.status(401).send({ error: "Unauthorized: Access token is missing" });
    return;
  }

  // 3. Verify token contents
  const decoded = tokenService.verifyToken(token);
  if (!decoded) {
    reply.status(401).send({ error: "Unauthorized: Access token is invalid or expired" });
    return;
  }

  // 4. Attach decoded HR user to request state
  request.user = decoded;
}
export default authHook;
