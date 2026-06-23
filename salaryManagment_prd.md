# Role & Context
You are an expert Principal Software Engineer and Product Architect. Your task is to build a production-quality, end-to-end "Global Employee Salary Management System" for an organization with 10,000 employees from scratch. You must strictly adhere to the requirements, technical stack, configuration schemas, and Onion Architecture pattern outlined below using Node.js and plain JavaScript (ES6+).

---

## 1. Technical Stack Specifications
- Frontend Framework: React.js (Plain JavaScript with ES Modules)
- Frontend State & Data Fetching: TanStack Query (React Query) for handling cached server state, automatic re-fetching, and smooth pagination/search synchronization
- Frontend UI Styling: Tailwind CSS paired with a clean component utility or Lucide-React for interface iconography and modals
- Backend Framework: Node.js with Fastify (High-performance, low-overhead framework)
- Database: SQLite (Stored locally as a `.db` file via a lightweight engine)
- ORM: Drizzle ORM (Configured for standard JavaScript relational mapping and migrations)
- Validation: Zod (Utilized for parsing HTTP request bodies, query params, and system environment variables)
- Authentication: JSON Web Tokens (JWT) for stateless session handling (Token stored securely in HttpOnly cookies or standard authorization headers)
- Testing Framework: Jest or Vitest (Configured for standard JavaScript isolated unit testing)

---

## 2. Architectural Pattern: Onion (Clean) Architecture
You must strictly isolate layers. Code must be structured into independent concentric directories where dependencies only point inward. The business domain must have zero knowledge of databases, web frameworks, routers, or authentication systems.

Directory Structure to create (All files must use `.js` extensions):
├── src/
│   ├── domain/             # Core business models and functional contract definitions
│   │   ├── entities/       # Pure JavaScript factory functions or data structures (Employee, Salary, FinancialMetrics)
│   │   └── interfaces/     # Clear layout comments/JSDoc outlining repository expectations (e.g., IEmployeeRepository)
│   ├── application/        # Use Cases / Application logic orchestration (No external framework dependencies)
│   │   └── use-cases/      # ListEmployees.js, UpdateSalary.js, GetMetrics.js, LoginUser.js
│   ├── infrastructure/     # Concrete structural implementations and external tools
│   │   ├── db/             # Drizzle schemas (schema.js), connection.js, seed.js
│   │   ├── repositories/   # EmployeeRepositoryImpl.js (Implements domain repository expectations via Drizzle)
│   │   └── auth/           # JwtTokenService.js (Handles concrete JWT generation and verification)
│   ├── presentation/       # Fastify HTTP delivery layers
│   │   ├── controllers/    # SalaryController.js, AuthController.js (Maps HTTP traffic to application use cases)
│   │   ├── hooks/          # authHook.js (Fastify preHandler hooks to guard protected sessions)
│   │   └── routes/         # api.js (Fastify plugin routes registration)
│   └── server.js           # System entry point initializing Fastify, registering routes, and attaching SQLite

---

## 3. Core Feature Requirements

### Feature 1: Session Authentication via JWT
- Implement a secure mechanism where the HR manager can log in using predefined administrative credentials.
- Upon successful validation, the Fastify backend issues a secure JWT containing user identity metadata.
- Create a Fastify `preHandler` hook (`src/presentation/hooks/authHook.js`) that verifies this incoming token on all dashboard, directory, and mutation routes. Protected paths must return an HTTP 401 Unauthorized code if the token is missing or expired.

### Feature 2: High-Performance Seeding Engine
- Create a script `src/infrastructure/db/seed.js` that automatically instantiates exactly 10,000 unique, logically realistic employee profiles inside the SQLite database.
- The script must algorithmically distribute records across:
  * Countries & Currencies: India (INR), United States (USD), United Kingdom (GBP), Germany (EUR).
  * Departments: Engineering, Product, HR, Sales, Marketing.
  * Financials: Logically mapped base salaries, performance bonuses, allowances, and local deductions.
- Optimization Requirement: To prevent SQLite memory exhaustion or write locks, you must utilize Drizzle bulk batch inserting (`db.insert().values()`) clustered in execution chunks of 1,000 records.

### Feature 3: HR Management Dashboard & Aggregates
- Provide the HR manager with real-time operational answers regarding global company spending without requiring manual math calculations.
- Calculate and expose via a clean, unified dashboard endpoint:
  * Total global run-rate (Gross company spend aggregated elegantly or broken down by currency code).
  * Headcount metrics (Total active headcount distributed by home country).
  * Departmental expenditure allocations (Average baseline salary vs. average bonus payouts grouped cleanly by department).

### Feature 4: Server-Side Paginated Directory via TanStack Query
- Build a tabular, high-speed UI grid view capable of navigating the 10,000 record index efficiently without causing browser runtime latency.
- Enforce strict server-side pagination boundaries (`LIMIT` and `OFFSET` in repository SQL queries), defaulting to 20 rows per view.
- Support reactive search indexing (mapping strings to Employee Name or Employee ID) and multi-select filtering matrices (by Country and Department).
- **TanStack Query Integration:** Use `useQuery` on the frontend with dependencies on the current page number, search term, and filters to achieve seamless caching, loading indicators, and rapid pagination transitions.

### Feature 5: Salary Modification Workflow
- Provide a secure administrative modal allowing the authenticated HR manager to update an individual employee's salary, bonus structure, or allowance allocations.
- Security Constraint: The mutation payload must pass through a strict Zod schema validation layer. Any invalid numbers, negative currencies, or malformed data must be rejected immediately with an HTTP 400 Bad Request before executing business logic.
- **TanStack Query Mutation:** Use `useMutation` on the frontend to execute the payload. Upon a successful response, use `queryClient.invalidateQueries` to automatically trigger an updated background fetch of the directory data and the dashboard metrics.

---

## 4. System Data Modeling (Drizzle Relational Schema)

Implement the relational layer inside `src/infrastructure/db/schema.js` using standard Drizzle JavaScript definitions:

1. **Users Table (`users`)** - *For HR Authentication*
   - `id`: Text, Primary Key
   - `username`: Text, Unique, Not Null
   - `passwordHash`: Text, Not Null

2. **Employees Table (`employees`)**
   - `id`: Text, Primary Key
   - `employeeId`: Text, Unique, Not Null (e.g., "ACME-10023")
   - `firstName`: Text, Not Null
   - `lastName`: Text, Not Null
   - `email`: Text, Unique, Not Null
   - `department`: Text, Not Null
   - `role`: Text, Not Null
   - `country`: Text, Not Null
   - `currency`: Text, Not Null
   - `createdAt`: Timestamp, Default Now

3. **Compensation Table (`compensation`)**
   - `id`: Text, Primary Key
   - `employeeId`: Text, Reference to `employees.id` (With On Delete Cascade)
   - `baseSalary`: Integer, Not Null (Stored as the lowest common currency denominator like cents/paise to eliminate JavaScript floating-point rounding bugs)
   - `bonus`: Integer, Default 0
   - `allowances`: Integer, Default 0
   - `deductions`: Integer, Default 0
   - `updatedAt`: Timestamp, Default Now

---

## 5. Explicitly Out of Scope (Deliberate Omissions)
To protect execution focus and maintain high architectural quality, intentionally omit:
- Live banking transfers, payment processing rails, or active financial clearinghouse APIs.
- Multi-tenant Role-Based Access Control (RBAC). Assume a single omnipotent "HR Manager" administrator account.
- Temporal historical tracking tables. Modifying a salary overwrites the user's current record directly inside the `compensation` table.

---

## 6. Execution Command

Generate the full project implementation from scratch using plain JavaScript.
1. Provide the complete operational codebase across all listed Onion layers using standard JavaScript `import/export` syntax.
2. Provide standard initialization files (`package.json`, `drizzle.config.js`). Do not generate any TypeScript configuration or `.ts` files.
3. Ensure Fastify schemas or validation strategies leverage Zod cleanly for payload safety.
4. Set up the React entry point wrapped with TanStack Query's `QueryClientProvider`.
5. Write isolated, deterministic JavaScript unit tests for the core business layer (`src/application/use-cases/`) using mocked repository objects to guarantee sub-second test execution without active database connections.

Do not use placeholders, shorthand syntax, or truncated comments like `// TODO: implement rest here`. Write out fully functional, production-ready files. Let's begin building.