import { describe, it, expect } from "vitest";
import { createEmployee } from "../src/domain/entities/Employee.js";
import { createSalary } from "../src/domain/entities/Salary.js";

describe("Domain Entities", () => {

  // ==========================================
  // Employee Entity Tests
  // ==========================================
  describe("Employee Entity", () => {
    const validEmployeeData = {
      id: "emp-1",
      employeeId: "ACME-10001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@acme.com",
      department: "Engineering",
      role: "Software Engineer",
      country: "India",
      currency: "INR",
      joiningDate: "2024-01-15",
    };

    it("should create a valid frozen employee object with fullName", () => {
      const employee = createEmployee(validEmployeeData);
      expect(employee.id).toBe("emp-1");
      expect(employee.employeeId).toBe("ACME-10001");
      expect(employee.firstName).toBe("John");
      expect(employee.lastName).toBe("Doe");
      expect(employee.fullName).toBe("John Doe");
      expect(employee.email).toBe("john.doe@acme.com");
      expect(employee.department).toBe("Engineering");
      expect(employee.role).toBe("Software Engineer");
      expect(employee.country).toBe("India");
      expect(employee.currency).toBe("INR");
      expect(Object.isFrozen(employee)).toBe(true);
    });

    it("should normalize email to lowercase", () => {
      const employee = createEmployee({ ...validEmployeeData, email: "JOHN.DOE@ACME.COM" });
      expect(employee.email).toBe("john.doe@acme.com");
    });

    it("should normalize currency to uppercase", () => {
      const employee = createEmployee({ ...validEmployeeData, currency: "inr" });
      expect(employee.currency).toBe("INR");
    });

    it("should trim whitespace from all string fields", () => {
      const employee = createEmployee({
        ...validEmployeeData,
        employeeId: "  ACME-10001  ",
        firstName: "  John  ",
        lastName: "  Doe  ",
        email: "  john@acme.com  ",
        department: "  Engineering  ",
        role: "  Engineer  ",
        country: "  India  ",
        currency: "  INR  ",
      });
      expect(employee.employeeId).toBe("ACME-10001");
      expect(employee.firstName).toBe("John");
      expect(employee.lastName).toBe("Doe");
      expect(employee.email).toBe("john@acme.com");
      expect(employee.department).toBe("Engineering");
      expect(employee.role).toBe("Engineer");
      expect(employee.country).toBe("India");
      expect(employee.currency).toBe("INR");
    });

    it("should throw 'Invalid Employee ID' when employeeId is empty string", () => {
      expect(() => createEmployee({ ...validEmployeeData, employeeId: "" }))
        .toThrow("Invalid Employee ID");
    });

    it("should throw 'Invalid Employee ID' when employeeId is null", () => {
      expect(() => createEmployee({ ...validEmployeeData, employeeId: null }))
        .toThrow("Invalid Employee ID");
    });

    it("should throw 'Invalid Employee ID' when employeeId is non-string type", () => {
      expect(() => createEmployee({ ...validEmployeeData, employeeId: 12345 }))
        .toThrow("Invalid Employee ID");
    });

    it("should throw 'Invalid Employee ID' when employeeId is whitespace only", () => {
      expect(() => createEmployee({ ...validEmployeeData, employeeId: "   " }))
        .toThrow("Invalid Employee ID");
    });

    it("should throw 'Invalid First Name' when firstName is empty", () => {
      expect(() => createEmployee({ ...validEmployeeData, firstName: "" }))
        .toThrow("Invalid First Name");
    });

    it("should throw 'Invalid First Name' when firstName is null", () => {
      expect(() => createEmployee({ ...validEmployeeData, firstName: null }))
        .toThrow("Invalid First Name");
    });

    it("should throw 'Invalid Last Name' when lastName is empty", () => {
      expect(() => createEmployee({ ...validEmployeeData, lastName: "" }))
        .toThrow("Invalid Last Name");
    });

    it("should throw 'Invalid Last Name' when lastName is null", () => {
      expect(() => createEmployee({ ...validEmployeeData, lastName: null }))
        .toThrow("Invalid Last Name");
    });

    it("should throw 'Invalid Email Address' when email has no @ symbol", () => {
      expect(() => createEmployee({ ...validEmployeeData, email: "invalid-email" }))
        .toThrow("Invalid Email Address");
    });

    it("should throw 'Invalid Email Address' when email is empty", () => {
      expect(() => createEmployee({ ...validEmployeeData, email: "" }))
        .toThrow("Invalid Email Address");
    });

    it("should throw 'Invalid Department' when department is empty", () => {
      expect(() => createEmployee({ ...validEmployeeData, department: "" }))
        .toThrow("Invalid Department");
    });

    it("should throw 'Invalid Department' when department is null", () => {
      expect(() => createEmployee({ ...validEmployeeData, department: null }))
        .toThrow("Invalid Department");
    });

    it("should throw 'Invalid Role' when role is empty", () => {
      expect(() => createEmployee({ ...validEmployeeData, role: "" }))
        .toThrow("Invalid Role");
    });

    it("should throw 'Invalid Role' when role is null", () => {
      expect(() => createEmployee({ ...validEmployeeData, role: null }))
        .toThrow("Invalid Role");
    });

    it("should throw 'Invalid Country' when country is empty", () => {
      expect(() => createEmployee({ ...validEmployeeData, country: "" }))
        .toThrow("Invalid Country");
    });

    it("should throw 'Invalid Country' when country is null", () => {
      expect(() => createEmployee({ ...validEmployeeData, country: null }))
        .toThrow("Invalid Country");
    });

    it("should throw 'Invalid Currency' when currency is empty", () => {
      expect(() => createEmployee({ ...validEmployeeData, currency: "" }))
        .toThrow("Invalid Currency");
    });

    it("should throw 'Invalid Currency' when currency is null", () => {
      expect(() => createEmployee({ ...validEmployeeData, currency: null }))
        .toThrow("Invalid Currency");
    });

    it("should set createdAt to default Date when not provided", () => {
      const employee = createEmployee(validEmployeeData);
      expect(employee.createdAt).toBeInstanceOf(Date);
    });

    it("should preserve custom createdAt when provided", () => {
      const customDate = new Date("2024-01-15");
      const employee = createEmployee({ ...validEmployeeData, createdAt: customDate });
      expect(employee.createdAt).toBe(customDate);
    });
  });

  // ==========================================
  // Salary Entity Tests
  // ==========================================
  describe("Salary Entity", () => {
    const validSalaryData = {
      id: "comp-1",
      employeeId: "emp-1",
      baseSalary: 5000000,
      bonus: 500000,
      allowances: 200000,
      deductions: 100000,
    };

    it("should create a valid frozen salary with correct grossSalary and netSalary", () => {
      const salary = createSalary(validSalaryData);
      expect(salary.id).toBe("comp-1");
      expect(salary.employeeId).toBe("emp-1");
      expect(salary.baseSalary).toBe(5000000);
      expect(salary.bonus).toBe(500000);
      expect(salary.allowances).toBe(200000);
      expect(salary.deductions).toBe(100000);
      // grossSalary = baseSalary + bonus + allowances = 5000000 + 500000 + 200000 = 5700000
      expect(salary.grossSalary).toBe(5700000);
      // netSalary = grossSalary - deductions = 5700000 - 100000 = 5600000
      expect(salary.netSalary).toBe(5600000);
      expect(Object.isFrozen(salary)).toBe(true);
    });

    it("should use default values of 0 for bonus, allowances, and deductions", () => {
      const salary = createSalary({ id: "comp-1", employeeId: "emp-1", baseSalary: 1000000 });
      expect(salary.bonus).toBe(0);
      expect(salary.allowances).toBe(0);
      expect(salary.deductions).toBe(0);
      expect(salary.grossSalary).toBe(1000000);
      expect(salary.netSalary).toBe(1000000);
    });

    it("should clamp netSalary to 0 when deductions exceed gross salary (Math.max guard)", () => {
      const salary = createSalary({
        id: "comp-1",
        employeeId: "emp-1",
        baseSalary: 100,
        bonus: 0,
        allowances: 0,
        deductions: 500, // deductions > gross
      });
      expect(salary.grossSalary).toBe(100);
      expect(salary.netSalary).toBe(0); // Math.max(0, 100 - 500) = 0
    });

    it("should set updatedAt default to current Date when not provided", () => {
      const salary = createSalary(validSalaryData);
      expect(salary.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw 'Invalid Employee Reference' when employeeId is empty", () => {
      expect(() => createSalary({ ...validSalaryData, employeeId: "" }))
        .toThrow("Invalid Employee Reference");
    });

    it("should throw 'Invalid Employee Reference' when employeeId is null", () => {
      expect(() => createSalary({ ...validSalaryData, employeeId: null }))
        .toThrow("Invalid Employee Reference");
    });

    it("should throw 'Invalid Employee Reference' when employeeId is whitespace only", () => {
      expect(() => createSalary({ ...validSalaryData, employeeId: "   " }))
        .toThrow("Invalid Employee Reference");
    });

    it("should throw error when baseSalary is negative", () => {
      expect(() => createSalary({ ...validSalaryData, baseSalary: -100 }))
        .toThrow("Base Salary must be a non-negative integer");
    });

    it("should throw error when baseSalary is a non-integer float", () => {
      expect(() => createSalary({ ...validSalaryData, baseSalary: 100.5 }))
        .toThrow("Base Salary must be a non-negative integer");
    });

    it("should throw error when bonus is negative", () => {
      expect(() => createSalary({ ...validSalaryData, bonus: -50 }))
        .toThrow("Bonus must be a non-negative integer");
    });

    it("should throw error when bonus is a non-integer float", () => {
      expect(() => createSalary({ ...validSalaryData, bonus: 10.5 }))
        .toThrow("Bonus must be a non-negative integer");
    });

    it("should throw error when allowances is negative", () => {
      expect(() => createSalary({ ...validSalaryData, allowances: -50 }))
        .toThrow("Allowances must be a non-negative integer");
    });

    it("should throw error when allowances is a non-integer float", () => {
      expect(() => createSalary({ ...validSalaryData, allowances: 10.5 }))
        .toThrow("Allowances must be a non-negative integer");
    });

    it("should throw error when deductions is negative", () => {
      expect(() => createSalary({ ...validSalaryData, deductions: -50 }))
        .toThrow("Deductions must be a non-negative integer");
    });

    it("should throw error when deductions is a non-integer float", () => {
      expect(() => createSalary({ ...validSalaryData, deductions: 10.5 }))
        .toThrow("Deductions must be a non-negative integer");
    });

    it("should accept zero values for all numeric fields", () => {
      const salary = createSalary({
        id: "comp-1",
        employeeId: "emp-1",
        baseSalary: 0,
        bonus: 0,
        allowances: 0,
        deductions: 0,
      });
      expect(salary.grossSalary).toBe(0);
      expect(salary.netSalary).toBe(0);
    });

    it("should accept string numbers that can be parsed as valid integers", () => {
      // Number("500") = 500, which is an integer and non-negative
      const salary = createSalary({ ...validSalaryData, baseSalary: "500" });
      expect(salary.baseSalary).toBe(500);
    });
  });

});
