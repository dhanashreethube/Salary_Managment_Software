import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoist all mock functions so they're available in vi.mock factories
const mocks = vi.hoisted(() => ({
  mockLoginExecute: vi.fn(),
  mockListExecute: vi.fn(),
  mockUpdateExecute: vi.fn(),
  mockMetricsExecute: vi.fn(),
}));

// ---- Mock infrastructure layer to prevent real DB connections ----
vi.mock("../src/infrastructure/repositories/UserRepositoryImpl.js", () => ({
  createUserRepository: () => ({}),
}));
vi.mock("../src/infrastructure/repositories/EmployeeRepositoryImpl.js", () => ({
  createEmployeeRepository: () => ({}),
}));
vi.mock("../src/infrastructure/auth/JwtTokenService.js", () => ({
  createJwtTokenService: () => ({}),
}));

// ---- Mock use case factories to inject controlled execute() fns ----
vi.mock("../src/application/use-cases/LoginUser.js", () => ({
  createLoginUser: () => ({ execute: mocks.mockLoginExecute }),
}));
vi.mock("../src/application/use-cases/ListEmployees.js", () => ({
  createListEmployees: () => ({ execute: mocks.mockListExecute }),
}));
vi.mock("../src/application/use-cases/UpdateSalary.js", () => ({
  createUpdateSalary: () => ({ execute: mocks.mockUpdateExecute }),
}));
vi.mock("../src/application/use-cases/GetMetrics.js", () => ({
  createGetMetrics: () => ({ execute: mocks.mockMetricsExecute }),
}));

// ---- Import controllers AFTER mocks are in place ----
import { createAuthController } from "../src/presentation/controllers/AuthController.js";
import { createSalaryController } from "../src/presentation/controllers/SalaryController.js";

describe("Presentation Layer - Controllers", () => {
  let mockReply;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      setCookie: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
    };
  });

  // ==========================================
  // AuthController Tests
  // ==========================================
  describe("AuthController", () => {
    const authController = createAuthController();

    it("login should call use case with credentials and return user + token", async () => {
      mocks.mockLoginExecute.mockResolvedValue({
        user: { id: "u1", username: "admin" },
        token: "jwt-token-xyz",
      });

      const request = { body: { username: "admin", password: "Password123" } };
      const result = await authController.login(request, mockReply);

      expect(mocks.mockLoginExecute).toHaveBeenCalledWith("admin", "Password123");
      expect(result.user.username).toBe("admin");
      expect(result.token).toBe("jwt-token-xyz");
    });

    it("login should set httpOnly cookie with correct security options", async () => {
      mocks.mockLoginExecute.mockResolvedValue({
        user: { id: "u1", username: "admin" },
        token: "jwt-session-token",
      });

      const request = { body: { username: "admin", password: "pass" } };
      await authController.login(request, mockReply);

      expect(mockReply.setCookie).toHaveBeenCalledWith("token", "jwt-session-token", expect.objectContaining({
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        maxAge: 28800, // 8 hours
      }));
    });

    it("login should propagate error with correct statusCode on auth failure", async () => {
      const authError = new Error("Invalid username or password");
      authError.statusCode = 401;
      mocks.mockLoginExecute.mockRejectedValue(authError);

      const request = { body: { username: "wrong", password: "wrong" } };
      await authController.login(request, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({ error: "Invalid username or password" });
    });

    it("login should default to 500 status when error has no statusCode", async () => {
      mocks.mockLoginExecute.mockRejectedValue(new Error("Unexpected crash"));

      const request = { body: { username: "admin", password: "pass" } };
      await authController.login(request, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: "Unexpected crash" });
    });

    it("login should handle missing request.body gracefully", async () => {
      // request.body is undefined → fallback to {}
      mocks.mockLoginExecute.mockRejectedValue(new Error("Username and password are required"));

      const request = {}; // No body
      await authController.login(request, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
    });

    it("logout should clear cookie and return success message", async () => {
      const request = {};
      const result = await authController.logout(request, mockReply);

      expect(mockReply.clearCookie).toHaveBeenCalledWith("token", { path: "/" });
      expect(result).toEqual({ success: true, message: "Logged out successfully" });
    });

    it("me should return the user attached to the request by authHook", async () => {
      const request = { user: { id: "admin-uuid", username: "admin" } };
      const result = await authController.me(request, mockReply);

      expect(result).toEqual({ user: { id: "admin-uuid", username: "admin" } });
    });
  });

  // ==========================================
  // SalaryController Tests
  // ==========================================
  describe("SalaryController", () => {
    const salaryController = createSalaryController();

    it("getEmployees should forward query params to the ListEmployees use case", async () => {
      mocks.mockListExecute.mockResolvedValue({ employees: [{ id: "e1" }], total: 1 });

      const request = { query: { page: "2", limit: "10", search: "John", country: "India", department: "Eng" } };
      const result = await salaryController.getEmployees(request, mockReply);

      expect(mocks.mockListExecute).toHaveBeenCalledWith({
        page: "2", limit: "10", search: "John", country: "India", department: "Eng",
      });
      expect(result.total).toBe(1);
    });

    it("getEmployees should handle errors with correct status code", async () => {
      const error = new Error("Database unreachable");
      error.statusCode = 503;
      mocks.mockListExecute.mockRejectedValue(error);

      const request = { query: {} };
      await salaryController.getEmployees(request, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(503);
      expect(mockReply.send).toHaveBeenCalledWith({ error: "Database unreachable" });
    });

    it("getEmployees should handle missing request.query gracefully", async () => {
      mocks.mockListExecute.mockResolvedValue({ employees: [], total: 0 });

      const request = {}; // No query property
      await salaryController.getEmployees(request, mockReply);

      expect(mocks.mockListExecute).toHaveBeenCalled();
    });

    it("updateSalary should read params.id and body, then forward to use case", async () => {
      const updatedComp = { id: "comp-1", baseSalary: 6000000, bonus: 500000, allowances: 100000, deductions: 200000 };
      mocks.mockUpdateExecute.mockResolvedValue(updatedComp);

      const request = {
        params: { id: "emp-1" },
        body: { baseSalary: 6000000, bonus: 500000, allowances: 100000, deductions: 200000 },
      };
      const result = await salaryController.updateSalary(request, mockReply);

      expect(mocks.mockUpdateExecute).toHaveBeenCalledWith("emp-1", {
        baseSalary: 6000000, bonus: 500000, allowances: 100000, deductions: 200000,
      });
      expect(result.baseSalary).toBe(6000000);
    });

    it("updateSalary should handle validation errors with 400 status", async () => {
      const validationError = new Error("Validation failed: Base salary cannot be negative");
      validationError.statusCode = 400;
      mocks.mockUpdateExecute.mockRejectedValue(validationError);

      const request = { params: { id: "emp-1" }, body: { baseSalary: -100 } };
      await salaryController.updateSalary(request, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: "Validation failed: Base salary cannot be negative" });
    });

    it("updateSalary should handle not-found errors with 404 status", async () => {
      const notFoundError = new Error("Employee not found");
      notFoundError.statusCode = 404;
      mocks.mockUpdateExecute.mockRejectedValue(notFoundError);

      const request = { params: { id: "nonexistent" }, body: { baseSalary: 1000 } };
      await salaryController.updateSalary(request, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(404);
    });

    it("getMetrics should call use case and return aggregated metrics", async () => {
      const metricsData = {
        headcount: { total: 100, distribution: [] },
        runRates: { totalUSD: 500000, breakdown: [] },
        departmentAllocations: [],
      };
      mocks.mockMetricsExecute.mockResolvedValue(metricsData);

      const request = {};
      const result = await salaryController.getMetrics(request, mockReply);

      expect(mocks.mockMetricsExecute).toHaveBeenCalled();
      expect(result).toEqual(metricsData);
    });

    it("getMetrics should handle errors with default 500 status", async () => {
      mocks.mockMetricsExecute.mockRejectedValue(new Error("Aggregation failed"));

      const request = {};
      await salaryController.getMetrics(request, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: "Aggregation failed" });
    });
  });
});
