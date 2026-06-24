import { z } from "zod";
import { createSalary } from "../../domain/entities/Salary.js";

// Zod Schema validating salary modification inputs
export const updateSalarySchema = z.object({
  baseSalary: z.number({ required_error: "Base salary is required" })
    .int("Base salary must be an integer (lowest common denominator)")
    .nonnegative("Base salary cannot be negative"),
  bonus: z.number().int("Bonus must be an integer").nonnegative("Bonus cannot be negative").default(0),
  allowances: z.number().int("Allowances must be an integer").nonnegative("Allowances cannot be negative").default(0),
  deductions: z.number().int("Deductions must be an integer").nonnegative("Deductions cannot be negative").default(0),
});

/**
 * Use Case: UpdateSalary
 * Modifies an employee's compensation after rigorous format validation.
 */
export function createUpdateSalary(employeeRepository) {
  /**
   * Execute use case logic
   * @param {string} employeeId - The database PK of the target employee
   * @param {Object} salaryData - Object containing baseSalary, bonus, allowances, deductions
   * @throws {Error} if validation fails or target employee does not exist
   */
  async function execute(employeeId, salaryData) {
    if (!employeeId) {
      throw new Error("Employee ID is required");
    }

    // 1. Validate payload structure using Zod
    const validationResult = updateSalarySchema.safeParse(salaryData);
    if (!validationResult.success) {
      const errMsgs = validationResult.error.issues.map(i => i.message).join(", ");
      const validationError = new Error(`Validation failed: ${errMsgs}`);
      validationError.statusCode = 400; // Tag with status code for presentation layer
      throw validationError;
    }

    const cleanData = validationResult.data;

    // 2. Verify employee exists in the database
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      const notFoundError = new Error(`Employee with ID "${employeeId}" not found`);
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    // 3. Create domain entity (will double check constraints)
    const salaryEntity = createSalary({
      id: employee.compensation?.id || `comp-${employeeId}`,
      employeeId: employeeId,
      baseSalary: cleanData.baseSalary,
      bonus: cleanData.bonus,
      allowances: cleanData.allowances,
      deductions: cleanData.deductions,
    });

    // 4. Update the repository
    const updatedRecord = await employeeRepository.updateCompensation(employeeId, {
      baseSalary: salaryEntity.baseSalary,
      bonus: salaryEntity.bonus,
      allowances: salaryEntity.allowances,
      deductions: salaryEntity.deductions,
    });

    return updatedRecord;
  }

  return { execute };
}
export default createUpdateSalary;
