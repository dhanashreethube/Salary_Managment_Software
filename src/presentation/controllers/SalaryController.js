import { ListEmployees } from "../../application/use-cases/ListEmployees.js";
import { UpdateSalary } from "../../application/use-cases/UpdateSalary.js";
import { GetMetrics } from "../../application/use-cases/GetMetrics.js";
import { EmployeeRepositoryImpl } from "../../infrastructure/repositories/EmployeeRepositoryImpl.js";

const employeeRepository = new EmployeeRepositoryImpl();
const listEmployeesUseCase = new ListEmployees(employeeRepository);
const updateSalaryUseCase = new UpdateSalary(employeeRepository);
const getMetricsUseCase = new GetMetrics(employeeRepository);

export class SalaryController {
  async getEmployees(request, reply) {
    try {
      const { page, limit, search, country, department } = request.query || {};
      const result = await listEmployeesUseCase.execute({
        page,
        limit,
        search,
        country,
        department,
      });
      return result;
    } catch (err) {
      const statusCode = err.statusCode || 500;
      reply.status(statusCode).send({ error: err.message });
    }
  }

  async updateSalary(request, reply) {
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

  async getMetrics(request, reply) {
    try {
      const metrics = await getMetricsUseCase.execute();
      return metrics;
    } catch (err) {
      const statusCode = err.statusCode || 500;
      reply.status(statusCode).send({ error: err.message });
    }
  }
}
export default SalaryController;
