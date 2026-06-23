import { LoginUser } from "../../application/use-cases/LoginUser.js";
import { UserRepositoryImpl } from "../../infrastructure/repositories/UserRepositoryImpl.js";
import { JwtTokenService } from "../../infrastructure/auth/JwtTokenService.js";

const userRepository = new UserRepositoryImpl();
const tokenService = new JwtTokenService();
const loginUserUseCase = new LoginUser(userRepository, tokenService);

export class AuthController {
  async login(request, reply) {
    try {
      const { username, password } = request.body || {};
      const { user, token } = await loginUserUseCase.execute(username, password);

      // Set cookie containing JWT session
      reply.setCookie("token", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 8 * 60 * 60, // 8 hours in seconds
      });

      return { user, token };
    } catch (err) {
      const statusCode = err.statusCode || 500;
      reply.status(statusCode).send({ error: err.message });
    }
  }

  async logout(request, reply) {
    reply.clearCookie("token", {
      path: "/",
    });
    return { success: true, message: "Logged out successfully" };
  }

  async me(request, reply) {
    // If request passes through authHook, user details are attached
    return { user: request.user };
  }
}
export default AuthController;
