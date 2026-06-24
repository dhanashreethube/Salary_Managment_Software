/**
 * Use Case: ListEmployees
 * Handles retrieval of paginated, filtered, sorted, and searched employee indexes.
 */

const ALLOWED_SORT_COLUMNS = ["employeeId", "firstName", "baseSalary", "joiningDate"];
const ALLOWED_SORT_ORDERS = ["asc", "desc"];

export function createListEmployees(employeeRepository) {
  /**
   * Execute use case logic
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @param {string} [params.search=""]
   * @param {string} [params.country=""]
   * @param {string} [params.department=""]
   * @param {string} [params.sortBy="employeeId"]
   * @param {string} [params.sortOrder="asc"]
   */
  async function execute({ page = 1, limit = 20, search = "", country = "", department = "", sortBy = "employeeId", sortOrder = "asc" }) {
    const activePage = Math.max(1, parseInt(page) || 1);
    const activeLimit = Math.max(1, Math.min(100, parseInt(limit) || 20));

    // Validate sort parameters against whitelist
    const validSortBy = ALLOWED_SORT_COLUMNS.includes(sortBy) ? sortBy : "employeeId";
    const validSortOrder = ALLOWED_SORT_ORDERS.includes(sortOrder) ? sortOrder : "asc";

    return await employeeRepository.findAll({
      page: activePage,
      limit: activeLimit,
      search,
      country,
      department,
      sortBy: validSortBy,
      sortOrder: validSortOrder,
    });
  }

  return { execute };
}
export default createListEmployees;
