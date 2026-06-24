import { createListEmployees } from "../../application/use-cases/ListEmployees.js";
import { createUpdateSalary } from "../../application/use-cases/UpdateSalary.js";
import { createGetMetrics } from "../../application/use-cases/GetMetrics.js";
import { createEmployeeRepository } from "../../infrastructure/repositories/EmployeeRepositoryImpl.js";

const employeeRepository = createEmployeeRepository();
const listEmployeesUseCase = createListEmployees(employeeRepository);
const updateSalaryUseCase = createUpdateSalary(employeeRepository);
const getMetricsUseCase = createGetMetrics(employeeRepository);

export function createSalaryController() {
  async function getEmployees(request, reply) {
    try {
      const { page, limit, search, country, department, sortBy, sortOrder } = request.query || {};
      const result = await listEmployeesUseCase.execute({
        page,
        limit,
        search,
        country,
        department,
        sortBy,
        sortOrder,
      });
      return result;
    } catch (err) {
      const statusCode = err.statusCode || 500;
      reply.status(statusCode).send({ error: err.message });
    }
  }

  async function updateSalary(request, reply) {
    try {
      const { id } = request.params;
      const salaryData = request.body;
      const updated = await updateSalaryUseCase.execute(id, salaryData);
      return updated;
    } catch (err) {
      const statusCode = err.statusCode || 500;
      reply.status(statusCode).send({ error: err.message });
    }
  }

  async function getMetrics(request, reply) {
    try {
      const metrics = await getMetricsUseCase.execute();
      return metrics;
    } catch (err) {
      const statusCode = err.statusCode || 500;
      reply.status(statusCode).send({ error: err.message });
    }
  }

  return { getEmployees, updateSalary, getMetrics };
}
export default createSalaryController;
