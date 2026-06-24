/**
 * Salary (Compensation) Domain Entity
 */
export function createSalary({
  id,
  employeeId,
  baseSalary,
  bonus = 0,
  allowances = 0,
  deductions = 0,
  comment = null,
  updatedAt = new Date(),
}) {
  if (!employeeId || typeof employeeId !== "string" || employeeId.trim() === "") {
    throw new Error("Invalid Employee Reference");
  }

  // Base salary, bonus, allowances, deductions must be non-negative integers
  const validateNonNegativeInteger = (val, name) => {
    const num = Number(val);
    if (!Number.isInteger(num) || num < 0) {
      throw new Error(`${name} must be a non-negative integer (lowest common denominator)`);
    }
    return num;
  };

  const parsedBaseSalary = validateNonNegativeInteger(baseSalary, "Base Salary");
  const parsedBonus = validateNonNegativeInteger(bonus, "Bonus");
  const parsedAllowances = validateNonNegativeInteger(allowances, "Allowances");
  const parsedDeductions = validateNonNegativeInteger(deductions, "Deductions");

  const grossSalary = parsedBaseSalary + parsedBonus + parsedAllowances;
  const netSalary = Math.max(0, grossSalary - parsedDeductions);

  return Object.freeze({
    id,
    employeeId,
    baseSalary: parsedBaseSalary,
    bonus: parsedBonus,
    allowances: parsedAllowances,
    deductions: parsedDeductions,
    comment: comment || null,
    updatedAt,
    grossSalary,
    netSalary,
  });
}
