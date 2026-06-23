import { describe, it, expect, vi } from "vitest";
import { LoginUser } from "../src/application/use-cases/LoginUser.js";
import { ListEmployees } from "../src/application/use-cases/ListEmployees.js";
import { UpdateSalary } from "../src/application/use-cases/UpdateSalary.js";
import { GetMetrics } from "../src/application/use-cases/GetMetrics.js";
import bcrypt from "bcryptjs";

// Mock implementation helper functions
const mockUser = {
  id: "admin-uuid",
  username: "admin",
  passwordHash: bcrypt.hashSync("Password123", 10),
};

describe("Onion Architecture - Use Case Unit Tests", () => {
  
  // ==========================================
  // LoginUser Use Case Tests
  // ==========================================
  describe("LoginUser", () => {
    it("should successfully authenticate administrative credentials and return a session token", async () => {
      const mockUserRepository = {
        findByUsername: vi.fn().mockResolvedValue(mockUser),
      };
      const mockTokenService = {
        generateToken: vi.fn().mockReturnValue("mock-jwt-token-xyz"),
      };

      const loginUseCase = new LoginUser(mockUserRepository, mockTokenService);
      const result = await loginUseCase.execute("admin", "Password123");

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith("admin");
      expect(mockTokenService.generateToken).toHaveBeenCalledWith({
        id: mockUser.id,
        username: mockUser.username,
      });
      expect(result.user.username).toBe("admin");
      expect(result.token).toBe("mock-jwt-token-xyz");
    });

    it("should throw an authentication error when username is incorrect", async () => {
      const mockUserRepository = {
        findByUsername: vi.fn().mockResolvedValue(null),
      };
      const mockTokenService = {
        generateToken: vi.fn(),
      };

      const loginUseCase = new LoginUser(mockUserRepository, mockTokenService);
      
      await expect(loginUseCase.execute("wrong-user", "Password123")).rejects.toThrow("Invalid username or password");
    });

    it("should throw an authentication error when password does not match", async () => {
      const mockUserRepository = {
        findByUsername: vi.fn().mockResolvedValue(mockUser),
      };
      const mockTokenService = {
        generateToken: vi.fn(),
      };

      const loginUseCase = new LoginUser(mockUserRepository, mockTokenService);

      await expect(loginUseCase.execute("admin", "WrongPassword")).rejects.toThrow("Invalid username or password");
    });
  });

  // ==========================================
  // ListEmployees Use Case Tests
  // ==========================================
  describe("ListEmployees", () => {
    it("should request paginated and filtered list from Employee Repository", async () => {
      const mockEmployeesResult = {
        employees: [
          { id: "emp-1", employeeId: "ACME-10001", firstName: "John", lastName: "Doe" }
        ],
        total: 1,
      };
      
      const mockEmployeeRepository = {
        findAll: vi.fn().mockResolvedValue(mockEmployeesResult),
      };

      const listUseCase = new ListEmployees(mockEmployeeRepository);
      const result = await listUseCase.execute({ page: 2, limit: 10, search: "John", country: "India" });

      expect(mockEmployeeRepository.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        search: "John",
        country: "India",
        department: "",
      });
      expect(result.employees.length).toBe(1);
      expect(result.total).toBe(1);
    });
  });

  // ==========================================
  // UpdateSalary Use Case Tests
  // ==========================================
  describe("UpdateSalary", () => {
    it("should successfully validate parameters via Zod, verify employee existence, and update compensation values", async () => {
      const mockEmployee = {
        id: "emp-1",
        firstName: "Jane",
        lastName: "Doe",
        compensation: {
          id: "comp-1",
          baseSalary: 5000000,
        },
      };

      const mockEmployeeRepository = {
        findById: vi.fn().mockResolvedValue(mockEmployee),
        updateCompensation: vi.fn().mockResolvedValue({
          id: "comp-1",
          baseSalary: 6000000,
          bonus: 500000,
          allowances: 100000,
          deductions: 200000,
        }),
      };

      const updateSalaryUseCase = new UpdateSalary(mockEmployeeRepository);
      const updatedSalaryData = {
        baseSalary: 6000000,
        bonus: 500000,
        allowances: 100000,
        deductions: 200000,
      };

      const result = await updateSalaryUseCase.execute("emp-1", updatedSalaryData);

      expect(mockEmployeeRepository.findById).toHaveBeenCalledWith("emp-1");
      expect(mockEmployeeRepository.updateCompensation).toHaveBeenCalledWith("emp-1", updatedSalaryData);
      expect(result.baseSalary).toBe(6000000);
    });

    it("should throw validation error (HTTP 400) if baseSalary or other parameters are negative", async () => {
      const mockEmployeeRepository = {
        findById: vi.fn(),
        updateCompensation: vi.fn(),
      };

      const updateSalaryUseCase = new UpdateSalary(mockEmployeeRepository);
      
      const invalidData = {
        baseSalary: -100, // Negative Base Salary is invalid
        bonus: 0,
        allowances: 0,
        deductions: 0,
      };

      try {
        await updateSalaryUseCase.execute("emp-1", invalidData);
        // Fail test if error not thrown
        expect(true).toBe(false);
      } catch (err) {
        expect(err.statusCode).toBe(400);
        expect(err.message).toContain("Validation failed");
      }
    });

    it("should throw not found error (HTTP 404) if employee does not exist in repository", async () => {
      const mockEmployeeRepository = {
        findById: vi.fn().mockResolvedValue(null),
        updateCompensation: vi.fn(),
      };

      const updateSalaryUseCase = new UpdateSalary(mockEmployeeRepository);
      const validData = {
        baseSalary: 5000000,
        bonus: 0,
        allowances: 0,
        deductions: 0,
      };

      try {
        await updateSalaryUseCase.execute("non-existent-id", validData);
        expect(true).toBe(false);
      } catch (err) {
        expect(err.statusCode).toBe(404);
        expect(err.message).toContain("not found");
      }
    });
  });

  // ==========================================
  // GetMetrics Use Case Tests
  // ==========================================
  describe("GetMetrics", () => {
    it("should pull metrics and correctly enrich run rates by currency converted to USD", async () => {
      const mockFinancialData = {
        headcountByCountry: [
          { country: "India", count: 80 },
          { country: "United States", count: 20 },
        ],
        departmentAllocations: [
          { department: "Engineering", avgBaseSalary: 8000000, avgBonus: 1000000, avgAllowances: 200000, avgDeductions: 500000, totalSpend: 9200000 },
        ],
        runRates: [
          { currency: "INR", totalBase: 800000000, totalBonus: 100000000, totalAllowances: 20000000, totalDeductions: 50000000, totalGrossSpend: 920000000, count: 80 },
          { currency: "USD", totalBase: 200000000, totalBonus: 30000000, totalAllowances: 10000000, totalDeductions: 15000000, totalGrossSpend: 240000000, count: 20 },
        ],
      };

      const mockEmployeeRepository = {
        getFinancialMetrics: vi.fn().mockResolvedValue(mockFinancialData),
      };

      const metricsUseCase = new GetMetrics(mockEmployeeRepository);
      const result = await metricsUseCase.execute();

      expect(mockEmployeeRepository.getFinancialMetrics).toHaveBeenCalled();
      expect(result.headcount.total).toBe(100);
      expect(result.headcount.distribution[0].percentage).toBe(80);
      expect(result.headcount.distribution[1].percentage).toBe(20);
      
      // Checking run-rate conversions:
      // INR real gross spend = 9,200,000 INR. USD Eq (rate = 1/83) = 110,843.37
      // USD real gross spend = 2,400,000 USD. USD Eq = 2,400,000
      // Total USD = 2,510,843 USD
      expect(result.runRates.totalUSD).toBe(2510843);
      expect(result.departmentAllocations[0].avgBaseSalaryReal).toBe(80000);
    });
  });

});
