import { createAuthController } from "../controllers/AuthController.js";
import { createSalaryController } from "../controllers/SalaryController.js";
import { authHook } from "../hooks/authHook.js";

const authController = createAuthController();
const salaryController = createSalaryController();

/**
 * Fastify routes plugin registering app endpoints
 */
export async function apiRoutes(fastify, options) {
  // Public authentication routes
  fastify.post("/auth/login", authController.login);
  fastify.post("/auth/logout", authController.logout);

  // Protected application routes sub-group
  fastify.register(async (protectedRoutes) => {
    // Attach auth preHandler hook to verify JWTs
    protectedRoutes.addHook("preHandler", authHook);

    // Session endpoint
    protectedRoutes.get("/auth/me", authController.me);

    // Salary and employee records endpoints
    protectedRoutes.get("/employees", salaryController.getEmployees);
    protectedRoutes.put("/employees/:id/compensation", salaryController.updateSalary);
    protectedRoutes.get("/metrics", salaryController.getMetrics);
  });
}
export default apiRoutes;
