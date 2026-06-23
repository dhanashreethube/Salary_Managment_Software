/**
 * IEmployeeRepository Interface Definition (JSDoc)
 * This outlines the contract that the concrete database repositories must fulfill.
 * 
 * @interface IEmployeeRepository
 */

/**
 * Find an employee by unique database record ID
 * @function
 * @name IEmployeeRepository#findById
 * @param {string} id - Database UUID or primary key
 * @returns {Promise<Object|null>} Resolved employee entity or null
 */

/**
 * Find an employee by unique corporate ID (e.g. ACME-10023)
 * @function
 * @name IEmployeeRepository#findByEmployeeId
 * @param {string} employeeId - Corporate ID
 * @returns {Promise<Object|null>} Resolved employee entity or null
 */

/**
 * Retrieve paginated, filtered, and searched employee list
 * @function
 * @name IEmployeeRepository#findAll
 * @param {Object} params
 * @param {number} params.page - Current page (1-based)
 * @param {number} params.limit - Max items per page
 * @param {string} [params.search] - Search keyword (name or employeeId)
 * @param {string} [params.country] - Filter by country
 * @param {string} [params.department] - Filter by department
 * @returns {Promise<{ employees: Array<Object>, total: number }>} Combined records list and total headcount matching criteria
 */

/**
 * Atomically update or insert salary details for an employee
 * @function
 * @name IEmployeeRepository#updateCompensation
 * @param {string} employeeId - Target employee ID (database PK or employeeId reference)
 * @param {Object} salaryData - Object matching baseSalary, bonus, allowances, deductions
 * @returns {Promise<Object>} Updated salary record entity
 */

/**
 * Compile financial run-rates and employee ratios
 * @function
 * @name IEmployeeRepository#getFinancialMetrics
 * @returns {Promise<Object>} Calculated metrics matching financial dashboards requirements
 */

/**
 * Batch insert a list of employee records and their initial compensation parameters
 * @function
 * @name IEmployeeRepository#bulkInsert
 * @param {Array<Object>} employeeRecords - Array of employees to insert
 * @param {Array<Object>} compensationRecords - Array of salaries corresponding to employees
 * @returns {Promise<void>}
 */

export class IEmployeeRepository {
  constructor() {
    if (new.target === IEmployeeRepository) {
      throw new TypeError("Cannot construct IEmployeeRepository instances directly");
    }
  }

  async findById(id) { throw new Error("Method not implemented"); }
  async findByEmployeeId(employeeId) { throw new Error("Method not implemented"); }
  async findAll(params) { throw new Error("Method not implemented"); }
  async updateCompensation(employeeId, salaryData) { throw new Error("Method not implemented"); }
  async getFinancialMetrics() { throw new Error("Method not implemented"); }
  async bulkInsert(employeeRecords, compensationRecords) { throw new Error("Method not implemented"); }
}
