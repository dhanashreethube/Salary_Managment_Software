import { eq, and, like, or, sql, count, sum, avg, asc, desc } from "drizzle-orm";
import { db } from "../db/connection.js";
import { employees, compensation } from "../db/schema.js";

// createEmployeeRepository implementation
export function createEmployeeRepository() {
  const latestComp = db
    .select({
      id: compensation.id,
      employeeId: compensation.employeeId,
      baseSalary: compensation.baseSalary,
      bonus: compensation.bonus,
      allowances: compensation.allowances,
      deductions: compensation.deductions,
      comment: compensation.comment,
      updatedAt: compensation.updatedAt,
      row_num: sql`row_number() over (partition by ${compensation.employeeId} order by ${compensation.updatedAt} desc)`.as("row_num"),
    })
    .from(compensation)
    .as("latest_comp");

  const SORT_COLUMN_MAP = {
    employeeId: employees.employeeId,
    firstName: employees.firstName,
    baseSalary: latestComp.baseSalary,
    joiningDate: employees.joiningDate,
  };

  async function findById(id) {
    const results = await db
      .select({
        employee: employees,
        compensation: {
          id: latestComp.id,
          baseSalary: latestComp.baseSalary,
          bonus: latestComp.bonus,
          allowances: latestComp.allowances,
          deductions: latestComp.deductions,
          comment: latestComp.comment,
          updatedAt: latestComp.updatedAt,
        },
      })
      .from(employees)
      .leftJoin(latestComp, and(eq(employees.id, latestComp.employeeId), eq(latestComp.row_num, 1)))
      .where(eq(employees.id, id))
      .all();

    if (results.length === 0) return null;
    
    const { employee, compensation: comp } = results[0];
    return {
      ...employee,
      compensation: comp.id ? comp : null,
    };
  }

  async function findByEmployeeId(employeeId) {
    const results = await db
      .select({
        employee: employees,
        compensation: {
          id: latestComp.id,
          baseSalary: latestComp.baseSalary,
          bonus: latestComp.bonus,
          allowances: latestComp.allowances,
          deductions: latestComp.deductions,
          comment: latestComp.comment,
          updatedAt: latestComp.updatedAt,
        },
      })
      .from(employees)
      .leftJoin(latestComp, and(eq(employees.id, latestComp.employeeId), eq(latestComp.row_num, 1)))
      .where(eq(employees.employeeId, employeeId))
      .all();

    if (results.length === 0) return null;
    
    const { employee, compensation: comp } = results[0];
    return {
      ...employee,
      compensation: comp.id ? comp : null,
    };
  }

  async function findAll({ page = 1, limit = 20, search = "", country = "", department = "", sortBy = "employeeId", sortOrder = "asc" }) {
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

    // Build sort clause from whitelist
    const sortColumn = SORT_COLUMN_MAP[sortBy] || SORT_COLUMN_MAP.employeeId;
    const orderFn = sortOrder === "desc" ? desc : asc;
    const orderClause = orderFn(sortColumn);

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
        joiningDate: employees.joiningDate,
        createdAt: employees.createdAt,
        compensation: {
          id: latestComp.id,
          baseSalary: latestComp.baseSalary,
          bonus: latestComp.bonus,
          allowances: latestComp.allowances,
          deductions: latestComp.deductions,
          comment: latestComp.comment,
          updatedAt: latestComp.updatedAt,
        },
      })
      .from(employees)
      .leftJoin(latestComp, and(eq(employees.id, latestComp.employeeId), eq(latestComp.row_num, 1)))
      .where(whereClause)
      .orderBy(orderClause)
      .limit(limit)
      .offset(offset);

    const records = await query.all();
    
    // Map records to keep structure same: if compensation has no id, set to null
    const mappedRecords = records.map(r => ({
      ...r,
      compensation: r.compensation.id ? r.compensation : null
    }));
    
    return {
      employees: mappedRecords,
      total,
    };
  }

  async function updateCompensation(employeeId, { baseSalary, bonus, allowances, deductions, comment }) {
    const timestamp = new Date();
    // Insert new compensation row (keeping history) rather than updating existing
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
        comment: comment || null,
        updatedAt: timestamp,
      })
      .run();

    const updated = await db
      .select()
      .from(compensation)
      .where(eq(compensation.employeeId, employeeId))
      .orderBy(desc(compensation.updatedAt))
      .limit(1)
      .all();

    return updated[0];
  }

  async function getFinancialMetrics() {
    // 1. Total headcount metrics (distribute by home country)
    const headcountResults = await db
      .select({
        country: employees.country,
        count: count(),
      })
      .from(employees)
      .groupBy(employees.country)
      .all();

    // 2. Departmental expenditure allocations (joining only latest compensation)
    const deptExpenditures = await db
      .select({
        department: employees.department,
        avgBaseSalary: avg(latestComp.baseSalary),
        avgBonus: avg(latestComp.bonus),
        avgAllowances: avg(latestComp.allowances),
        avgDeductions: avg(latestComp.deductions),
        totalSpend: sum(sql`${latestComp.baseSalary} + ${latestComp.bonus} + ${latestComp.allowances}`),
      })
      .from(employees)
      .leftJoin(latestComp, and(eq(employees.id, latestComp.employeeId), eq(latestComp.row_num, 1)))
      .groupBy(employees.department)
      .all();

    // 3. Global run-rate aggregated by currency code (joining only latest compensation)
    const runRatesByCurrency = await db
      .select({
        currency: employees.currency,
        totalBase: sum(latestComp.baseSalary),
        totalBonus: sum(latestComp.bonus),
        totalAllowances: sum(latestComp.allowances),
        totalDeductions: sum(latestComp.deductions),
        totalGrossSpend: sum(sql`${latestComp.baseSalary} + ${latestComp.bonus} + ${latestComp.allowances}`),
        count: count(),
      })
      .from(employees)
      .leftJoin(latestComp, and(eq(employees.id, latestComp.employeeId), eq(latestComp.row_num, 1)))
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

  async function bulkInsert(employeeRecords, compensationRecords) {
    await db.transaction((tx) => {
      tx.insert(employees).values(employeeRecords).run();
      tx.insert(compensation).values(compensationRecords).run();
    });
  }

  return {
    findById,
    findByEmployeeId,
    findAll,
    updateCompensation,
    getFinancialMetrics,
    bulkInsert
  };
}
