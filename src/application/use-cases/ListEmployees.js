/**
 * Use Case: ListEmployees
 * Handles retrieval of paginated, filtered, and searched employee indexes.
 */
export class ListEmployees {
  constructor(employeeRepository) {
    this.employeeRepository = employeeRepository;
  }

  /**
   * Execute use case logic
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @param {string} [params.search=""]
   * @param {string} [params.country=""]
   * @param {string} [params.department=""]
   */
  async execute({ page = 1, limit = 20, search = "", country = "", department = "" }) {
    const activePage = Math.max(1, parseInt(page) || 1);
    const activeLimit = Math.max(1, Math.min(100, parseInt(limit) || 20));

    return await this.employeeRepository.findAll({
      page: activePage,
      limit: activeLimit,
      search,
      country,
      department,
    });
  }
}
export default ListEmployees;
