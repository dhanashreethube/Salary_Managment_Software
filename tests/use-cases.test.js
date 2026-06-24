import { describe, it, expect, vi } from "vitest";
import { createLoginUser } from "../src/application/use-cases/LoginUser.js";
import { createListEmployees } from "../src/application/use-cases/ListEmployees.js";
import { createUpdateSalary } from "../src/application/use-cases/UpdateSalary.js";
import { createGetMetrics } from "../src/application/use-cases/GetMetrics.js";
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

      const loginUseCase = createLoginUser(mockUserRepository, mockTokenService);
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

      const loginUseCase = createLoginUser(mockUserRepository, mockTokenService);
      
      await expect(loginUseCase.execute("wrong-user", "Password123")).rejects.toThrow("Invalid username or password");
    });

    it("should throw an authentication error when password does not match", async () => {
      const mockUserRepository = {
        findByUsername: vi.fn().mockResolvedValue(mockUser),
      };
      const mockTokenService = {
        generateToken: vi.fn(),
      };

      const loginUseCase = createLoginUser(mockUserRepository, mockTokenService);

      await expect(loginUseCase.execute("admin", "WrongPassword")).rejects.toThrow("Invalid username or password");
    });
    it("should throw a 400 error when username is missing or null", async () => {
      const mockUserRepository = { findByUsername: vi.fn() };
      const mockTokenService = { generateToken: vi.fn() };
      const loginUseCase = createLoginUser(mockUserRepository, mockTokenService);

      try {
        await loginUseCase.execute(null, "Password123");
        expect(true).toBe(false);
      } catch (err) {
        expect(err.statusCode).toBe(400);
        expect(err.message).toContain("Username and password are required");
      }
    });

    it("should throw a 400 error when password is empty string", async () => {
      const mockUserRepository = { findByUsername: vi.fn() };
      const mockTokenService = { generateToken: vi.fn() };
      const loginUseCase = createLoginUser(mockUserRepository, mockTokenService);

      try {
        await loginUseCase.execute("admin", "");
        expect(true).toBe(false);
      } catch (err) {
        expect(err.statusCode).toBe(400);
        expect(err.message).toContain("Username and password are required");
      }
    });

    it("should not call generateToken when authentication fails", async () => {
      const mockUserRepository = { findByUsername: vi.fn().mockResolvedValue(null) };
      const mockTokenService = { generateToken: vi.fn() };
      const loginUseCase = createLoginUser(mockUserRepository, mockTokenService);

      try {
        await loginUseCase.execute("wrong-user", "Password123");
      } catch (err) {
        // Expected to throw
      }
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
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

      const listUseCase = createListEmployees(mockEmployeeRepository);
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
    it("should use default parameters when none are provided", async () => {
      const mockEmployeeRepository = {
        findAll: vi.fn().mockResolvedValue({ employees: [], total: 0 }),
      };
      const listUseCase = createListEmployees(mockEmployeeRepository);
      await listUseCase.execute({});

      expect(mockEmployeeRepository.findAll).toHaveBeenCalledWith({
        page: 1, limit: 20, search: "", country: "", department: "",
      });
    });

    it("should clamp page to minimum of 1 when negative value is given", async () => {
      const mockEmployeeRepository = {
        findAll: vi.fn().mockResolvedValue({ employees: [], total: 0 }),
      };
      const listUseCase = createListEmployees(mockEmployeeRepository);
      await listUseCase.execute({ page: -5 });

      expect(mockEmployeeRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });

    it("should clamp limit to maximum of 100", async () => {
      const mockEmployeeRepository = {
        findAll: vi.fn().mockResolvedValue({ employees: [], total: 0 }),
      };
      const listUseCase = createListEmployees(mockEmployeeRepository);
      await listUseCase.execute({ limit: 500 });

      expect(mockEmployeeRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });

    it("should clamp limit to minimum of 1", async () => {
      const mockEmployeeRepository = {
        findAll: vi.fn().mockResolvedValue({ employees: [], total: 0 }),
      };
      const listUseCase = createListEmployees(mockEmployeeRepository);
      await listUseCase.execute({ limit: -10 });

      expect(mockEmployeeRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 1 })
      );
    });

    it("should fallback to default page and limit for non-numeric values", async () => {
      const mockEmployeeRepository = {
        findAll: vi.fn().mockResolvedValue({ employees: [], total: 0 }),
      };
      const listUseCase = createListEmployees(mockEmployeeRepository);
      await listUseCase.execute({ page: "abc", limit: "xyz" });

      expect(mockEmployeeRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 })
      );
    });

    it("should pass department filter correctly to repository", async () => {
      const mockEmployeeRepository = {
        findAll: vi.fn().mockResolvedValue({ employees: [], total: 0 }),
      };
      const listUseCase = createListEmployees(mockEmployeeRepository);
      await listUseCase.execute({ department: "Engineering" });

      expect(mockEmployeeRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ department: "Engineering" })
      );
    });

    it("should return empty result set when no employees match", async () => {
      const mockEmployeeRepository = {
        findAll: vi.fn().mockResolvedValue({ employees: [], total: 0 }),
      };
      const listUseCase = createListEmployees(mockEmployeeRepository);
      const result = await listUseCase.execute({});

      expect(result.employees).toEqual([]);
      expect(result.total).toBe(0);
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

      const updateSalaryUseCase = createUpdateSalary(mockEmployeeRepository);
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

      const updateSalaryUseCase = createUpdateSalary(mockEmployeeRepository);
      
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

      const updateSalaryUseCase = createUpdateSalary(mockEmployeeRepository);
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
    it("should throw error when employeeId is empty string", async () => {
      const mockEmployeeRepository = { findById: vi.fn(), updateCompensation: vi.fn() };
      const updateSalaryUseCase = createUpdateSalary(mockEmployeeRepository);

      await expect(updateSalaryUseCase.execute("", { baseSalary: 1000 }))
        .rejects.toThrow("Employee ID is required");
    });

    it("should throw error when employeeId is null", async () => {
      const mockEmployeeRepository = { findById: vi.fn(), updateCompensation: vi.fn() };
      const updateSalaryUseCase = createUpdateSalary(mockEmployeeRepository);

      await expect(updateSalaryUseCase.execute(null, { baseSalary: 1000 }))
        .rejects.toThrow("Employee ID is required");
    });

    it("should throw validation error (HTTP 400) for non-integer baseSalary", async () => {
      const mockEmployeeRepository = { findById: vi.fn(), updateCompensation: vi.fn() };
      const updateSalaryUseCase = createUpdateSalary(mockEmployeeRepository);

      try {
        await updateSalaryUseCase.execute("emp-1", { baseSalary: 100.5, bonus: 0, allowances: 0, deductions: 0 });
        expect(true).toBe(false);
      } catch (err) {
        expect(err.statusCode).toBe(400);
        expect(err.message).toContain("Validation failed");
      }
    });

    it("should throw validation error (HTTP 400) when baseSalary field is missing entirely", async () => {
      const mockEmployeeRepository = { findById: vi.fn(), updateCompensation: vi.fn() };
      const updateSalaryUseCase = createUpdateSalary(mockEmployeeRepository);

      try {
        await updateSalaryUseCase.execute("emp-1", { bonus: 100, allowances: 0, deductions: 0 });
        expect(true).toBe(false);
      } catch (err) {
        expect(err.statusCode).toBe(400);
        expect(err.message).toContain("Validation failed");
      }
    });

    it("should apply Zod defaults of 0 for optional fields when only baseSalary is provided", async () => {
      const mockEmployee = {
        id: "emp-1", firstName: "Jane", lastName: "Doe",
        compensation: { id: "comp-1" },
      };
      const mockEmployeeRepository = {
        findById: vi.fn().mockResolvedValue(mockEmployee),
        updateCompensation: vi.fn().mockResolvedValue({
          id: "comp-1", baseSalary: 5000000, bonus: 0, allowances: 0, deductions: 0,
        }),
      };
      const updateSalaryUseCase = createUpdateSalary(mockEmployeeRepository);
      const result = await updateSalaryUseCase.execute("emp-1", { baseSalary: 5000000 });

      expect(mockEmployeeRepository.updateCompensation).toHaveBeenCalledWith("emp-1", {
        baseSalary: 5000000, bonus: 0, allowances: 0, deductions: 0,
      });
      expect(result.baseSalary).toBe(5000000);
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

      const metricsUseCase = createGetMetrics(mockEmployeeRepository);
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
    it("should handle empty data without division by zero", async () => {
      const mockEmployeeRepository = {
        getFinancialMetrics: vi.fn().mockResolvedValue({
          headcountByCountry: [],
          departmentAllocations: [],
          runRates: [],
        }),
      };
      const metricsUseCase = createGetMetrics(mockEmployeeRepository);
      const result = await metricsUseCase.execute();

      expect(result.headcount.total).toBe(0);
      expect(result.headcount.distribution).toEqual([]);
      expect(result.runRates.totalUSD).toBe(0);
      expect(result.runRates.breakdown).toEqual([]);
    });

    it("should use fallback exchange rate of 1.0 for unknown currency codes", async () => {
      const mockEmployeeRepository = {
        getFinancialMetrics: vi.fn().mockResolvedValue({
          headcountByCountry: [{ country: "Japan", count: 10 }],
          departmentAllocations: [],
          runRates: [
            { currency: "JPY", totalBase: 10000, totalBonus: 0, totalAllowances: 0, totalDeductions: 0, totalGrossSpend: 10000, count: 10 },
          ],
        }),
      };
      const metricsUseCase = createGetMetrics(mockEmployeeRepository);
      const result = await metricsUseCase.execute();

      // grossSpendReal = 10000 / 100 = 100, USD equivalent = 100 * 1.0 = 100
      expect(result.runRates.totalUSD).toBe(100);
    });

    it("should correctly convert GBP to USD using rate 1.25", async () => {
      const mockEmployeeRepository = {
        getFinancialMetrics: vi.fn().mockResolvedValue({
          headcountByCountry: [{ country: "United Kingdom", count: 5 }],
          departmentAllocations: [],
          runRates: [
            { currency: "GBP", totalBase: 100000, totalBonus: 0, totalAllowances: 0, totalDeductions: 0, totalGrossSpend: 100000, count: 5 },
          ],
        }),
      };
      const metricsUseCase = createGetMetrics(mockEmployeeRepository);
      const result = await metricsUseCase.execute();

      // grossSpendReal = 100000 / 100 = 1000, USD equivalent = 1000 * 1.25 = 1250
      expect(result.runRates.totalUSD).toBe(1250);
    });

    it("should correctly convert EUR to USD using rate 1.08", async () => {
      const mockEmployeeRepository = {
        getFinancialMetrics: vi.fn().mockResolvedValue({
          headcountByCountry: [{ country: "Germany", count: 3 }],
          departmentAllocations: [],
          runRates: [
            { currency: "EUR", totalBase: 200000, totalBonus: 0, totalAllowances: 0, totalDeductions: 0, totalGrossSpend: 200000, count: 3 },
          ],
        }),
      };
      const metricsUseCase = createGetMetrics(mockEmployeeRepository);
      const result = await metricsUseCase.execute();

      // grossSpendReal = 200000 / 100 = 2000, USD equivalent = 2000 * 1.08 = 2160
      expect(result.runRates.totalUSD).toBe(2160);
    });

    it("should calculate 100% distribution for a single-country headcount", async () => {
      const mockEmployeeRepository = {
        getFinancialMetrics: vi.fn().mockResolvedValue({
          headcountByCountry: [{ country: "India", count: 50 }],
          departmentAllocations: [],
          runRates: [],
        }),
      };
      const metricsUseCase = createGetMetrics(mockEmployeeRepository);
      const result = await metricsUseCase.execute();

      expect(result.headcount.total).toBe(50);
      expect(result.headcount.distribution).toHaveLength(1);
      expect(result.headcount.distribution[0].percentage).toBe(100);
    });
  });

});
