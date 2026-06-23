import { AuthController } from "../controllers/AuthController.js";
import { SalaryController } from "../controllers/SalaryController.js";
import { authHook } from "../hooks/authHook.js";

const authController = new AuthController();
const salaryController = new SalaryController();

/**
 * Fastify routes plugin registering app endpoints
 */
export async function apiRoutes(fastify, options) {
  // Public authentication routes
  fastify.post("/auth/login", authController.login.bind(authController));
  fastify.post("/auth/logout", authController.logout.bind(authController));

  // Protected application routes sub-group
  fastify.register(async (protectedRoutes) => {
    // Attach auth preHandler hook to verify JWTs
    protectedRoutes.addHook("preHandler", authHook);

    // Session endpoint
    protectedRoutes.get("/auth/me", authController.me.bind(authController));

    // Salary and employee records endpoints
    protectedRoutes.get("/employees", salaryController.getEmployees.bind(salaryController));
    protectedRoutes.put("/employees/:id/compensation", salaryController.updateSalary.bind(salaryController));
    protectedRoutes.get("/metrics", salaryController.getMetrics.bind(salaryController));
  });
}
export default apiRoutes;
