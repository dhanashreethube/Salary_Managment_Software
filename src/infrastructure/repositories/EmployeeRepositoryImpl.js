import { eq, and, like, or, sql, count, sum, avg } from "drizzle-orm";
import { db } from "../db/connection.js";
import { employees, compensation } from "../db/schema.js";
import { IEmployeeRepository } from "../../domain/interfaces/IEmployeeRepository.js";

export class EmployeeRepositoryImpl extends IEmployeeRepository {
  async findById(id) {
    const results = await db
      .select({
        employee: employees,
        compensation: compensation,
      })
      .from(employees)
      .leftJoin(compensation, eq(employees.id, compensation.employeeId))
      .where(eq(employees.id, id))
      .all();

    if (results.length === 0) return null;
    
    const { employee, compensation: comp } = results[0];
    return {
      ...employee,
      compensation: comp,
    };
  }

  async findByEmployeeId(employeeId) {
    const results = await db
      .select({
        employee: employees,
        compensation: compensation,
      })
      .from(employees)
      .leftJoin(compensation, eq(employees.id, compensation.employeeId))
      .where(eq(employees.employeeId, employeeId))
      .all();

    if (results.length === 0) return null;
    
    const { employee, compensation: comp } = results[0];
    return {
      ...employee,
      compensation: comp,
    };
  }

  async findAll({ page = 1, limit = 20, search = "", country = "", department = "" }) {
    const offset = (page - 1) * limit;
    
    // Construct filters
    const conditions = [];
    
    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          like(employees.firstName, searchTerm),
          like(employees.lastName, searchTerm),
          like(sql`${employees.firstName} || ' ' || ${employees.lastName}`, searchTerm),
          like(employees.employeeId, searchTerm)
        )
      );
    }
    
    if (country && country.trim() !== "") {
      conditions.push(eq(employees.country, country));
    }
    
    if (department && department.trim() !== "") {
      conditions.push(eq(employees.department, department));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 1. Fetch total count matching search and filters
    const countResult = await db
      .select({ value: count() })
      .from(employees)
      .where(whereClause)
      .all();
    const total = countResult[0]?.value || 0;

    // 2. Fetch paginated records joined with salary info
    const query = db
      .select({
        id: employees.id,
        employeeId: employees.employeeId,
        firstName: employees.firstName,
        lastName: employees.lastName,
        email: employees.email,
        department: employees.department,
        role: employees.role,
        country: employees.country,
        currency: employees.currency,
        createdAt: employees.createdAt,
        compensation: {
          id: compensation.id,
          baseSalary: compensation.baseSalary,
          bonus: compensation.bonus,
          allowances: compensation.allowances,
          deductions: compensation.deductions,
          updatedAt: compensation.updatedAt,
        },
      })
      .from(employees)
      .leftJoin(compensation, eq(employees.id, compensation.employeeId))
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    const records = await query.all();
    
    return {
      employees: records,
      total,
    };
  }

  async updateCompensation(employeeId, { baseSalary, bonus, allowances, deductions }) {
    // Note: employeeId refers to the database employees.id primary key
    const existing = await db
      .select()
      .from(compensation)
      .where(eq(compensation.employeeId, employeeId))
      .all();

    const timestamp = new Date();

    if (existing.length === 0) {
      // Insert new compensation if missing
      const compId = `comp-custom-${Date.now()}`;
      await db
        .insert(compensation)
        .values({
          id: compId,
          employeeId,
          baseSalary,
          bonus,
          allowances,
          deductions,
          updatedAt: timestamp,
        })
        .run();
    } else {
      // Update existing record
      await db
        .update(compensation)
        .set({
          baseSalary,
          bonus,
          allowances,
          deductions,
          updatedAt: timestamp,
        })
        .where(eq(compensation.employeeId, employeeId))
        .run();
    }

    const updated = await db
      .select()
      .from(compensation)
      .where(eq(compensation.employeeId, employeeId))
      .all();

    return updated[0];
  }

  async getFinancialMetrics() {
    // 1. Total headcount metrics (distribute by home country)
    const headcountResults = await db
      .select({
        country: employees.country,
        count: count(),
      })
      .from(employees)
      .groupBy(employees.country)
      .all();

    // 2. Departmental expenditure allocations
    const deptExpenditures = await db
      .select({
        department: employees.department,
        avgBaseSalary: avg(compensation.baseSalary),
        avgBonus: avg(compensation.bonus),
        avgAllowances: avg(compensation.allowances),
        avgDeductions: avg(compensation.deductions),
        totalSpend: sum(sql`${compensation.baseSalary} + ${compensation.bonus} + ${compensation.allowances}`),
      })
      .from(employees)
      .leftJoin(compensation, eq(employees.id, compensation.employeeId))
      .groupBy(employees.department)
      .all();

    // 3. Global run-rate aggregated by currency code
    const runRatesByCurrency = await db
      .select({
        currency: employees.currency,
        totalBase: sum(compensation.baseSalary),
        totalBonus: sum(compensation.bonus),
        totalAllowances: sum(compensation.allowances),
        totalDeductions: sum(compensation.deductions),
        totalGrossSpend: sum(sql`${compensation.baseSalary} + ${compensation.bonus} + ${compensation.allowances}`),
        count: count(),
      })
      .from(employees)
      .leftJoin(compensation, eq(employees.id, compensation.employeeId))
      .groupBy(employees.currency)
      .all();

    // Formulate a standardized metrics object
    return {
      headcountByCountry: headcountResults,
      departmentAllocations: deptExpenditures.map(d => ({
        department: d.department,
        avgBaseSalary: Math.round(Number(d.avgBaseSalary || 0)),
        avgBonus: Math.round(Number(d.avgBonus || 0)),
        avgAllowances: Math.round(Number(d.avgAllowances || 0)),
        avgDeductions: Math.round(Number(d.avgDeductions || 0)),
        totalSpend: Number(d.totalSpend || 0),
      })),
      runRates: runRatesByCurrency.map(r => ({
        currency: r.currency,
        totalBase: Number(r.totalBase || 0),
        totalBonus: Number(r.totalBonus || 0),
        totalAllowances: Number(r.totalAllowances || 0),
        totalDeductions: Number(r.totalDeductions || 0),
        totalGrossSpend: Number(r.totalGrossSpend || 0),
        employeeCount: r.count,
      })),
    };
  }

  async bulkInsert(employeeRecords, compensationRecords) {
    await db.transaction((tx) => {
      tx.insert(employees).values(employeeRecords).run();
      tx.insert(compensation).values(compensationRecords).run();
    });
  }
}
