# Product Requirements Document (PRD)

## 1. Technical Stack Specifications
- **Frontend Framework**: React.js (Plain JavaScript with ES Modules)
- **Frontend State & Data Fetching**: TanStack Query (React Query) for handling cached server state, automatic re-fetching, and smooth pagination/search synchronization
- **Frontend UI Styling**: Tailwind CSS paired with a clean component utility or Lucide-React for interface iconography and modals
- **Backend Framework**: Node.js with Fastify (High-performance, low-overhead framework)
- **Database**: SQLite (Stored locally as a `.db` file via a lightweight engine)
- **ORM**: Drizzle ORM (Configured for standard JavaScript relational mapping and migrations)
- **Validation**: Zod (Utilized for parsing HTTP request bodies, query params, and system environment variables)
- **Authentication**: JSON Web Tokens (JWT) for stateless session handling (Token stored securely in HttpOnly cookies or standard authorization headers)
- **Testing Framework**: Vitest (Configured for standard JavaScript isolated unit testing)

---

## 2. Architectural Pattern: Onion (Clean) Architecture
Strict isolation of layers. Code is structured into independent concentric directories where dependencies only point inward. The business domain has zero knowledge of databases, web frameworks, routers, or authentication systems.

### Directory Structure

#### Backend Directory Structure (src/)
```
├── domain/             # Core business models and functional contract definitions
│   ├── entities/       # Pure JavaScript factory functions or data structures (Employee, Salary)
│   └── interfaces/     # Clear layout comments/JSDoc outlining repository expectations
├── application/        # Use Cases / Application logic orchestration (No external framework dependencies)
│   └── use-cases/      # ListEmployees.js, UpdateSalary.js, GetMetrics.js, LoginUser.js
├── infrastructure/     # Concrete structural implementations and external tools
│   ├── db/             # Drizzle schemas (schema.js), connection.js, seed.js
│   ├── repositories/   # EmployeeRepositoryImpl.js, UserRepositoryImpl.js
│   └── auth/           # JwtTokenService.js (Handles concrete JWT generation/verification)
├── presentation/       # Fastify HTTP delivery layers
│   ├── controllers/    # SalaryController.js, AuthController.js
│   ├── hooks/          # authHook.js (preHandler hook to guard protected sessions)
│   └── routes/         # api.js (Fastify routes registration)
└── server.js           # System entry point
```

#### Frontend Directory Structure (frontend/src/)
```
├── presentation/           # HTTP Delivery & React View Layers
│   ├── components/         # Highly granular, atomic UI modules
│   │   ├── ui/             # Shared, generic, dumb layout blocks
│   │   │   ├── Header.jsx   # Global top navbar branding & session exit
│   │   │   ├── MetricCard.jsx # Isolated layout for top metrics
│   │   │   └── DataTable.jsx  # Reusable HTML table structure scaffolding
│   │   ├── dashboard/      # Single-responsibility Dashboard elements
│   │   │   ├── DashboardOverview.jsx # Container view layout coordinator
│   │   │   ├── SummaryCardsGrid.jsx  # Grid wrapper for KPI MetricCards
│   │   │   ├── DepartmentTable.jsx   # Formatted sector for departmental spend
│   │   │   ├── HeadcountList.jsx     # Geographic progress bar distribution
│   │   │   └── CurrencyPanels.jsx    # Metric blocks for annual spend clusters
│   │   └── directory/      # Single-responsibility Directory elements
│   │       ├── DirectoryOverview.jsx # Grid view layout coordinator
│   │       ├── SearchBar.jsx         # Magnifying glass text input component
│   │       ├── FilterSelects.jsx     # Dropdown menus for country/department
│   │       ├── ControlPanel.jsx      # Composes filters, search, and refresh sync
│   │       ├── EmployeeRow.jsx       # Layout for a single <tr> table row
│   │       └── PaginationNav.jsx     # Footer footer boundary controls
```

---

## 3. Core Feature Requirements

### Feature 1: Session Authentication via JWT
- HR manager logs in using predefined administrative credentials.
- Backend issues a secure JWT stored in HTTP-only cookies or authorization headers.
- Fastify `preHandler` hook (`authHook.js`) intercepts and guards protected routes. Returns HTTP 401 on missing/expired tokens.
- **Default Seed Account:** For evaluation and grading purposes, the local database initializes with a baseline administrative user profile:
  * **Username:** admin
  * **Password:** Password123

### Feature 2: High-Performance Seeding Engine
- Seeding engine generates exactly 10,000 unique records.
- Realistic distribution across:
  - Countries & Currencies: India (INR), United States (USD), United Kingdom (GBP), Germany (EUR).
  - Departments: Engineering, Product, HR, Sales, Marketing.
  - Financials: Base salaries, performance bonuses, allowances, and local deductions.
- To prevent database lockups, seeds are bulk inserted in batches of 1,000.

### Feature 3: HR Management Dashboard & Aggregates
- Aggregates operational answers without manual calculations.
- Exposes:
  - Total global run-rate (Gross spend aggregated or broken down by currency code).
  - Headcount metrics (Distributed by home country).
  - Departmental expenditure allocations (Average baseline salary vs. average bonus payouts).

### Feature 4: Server-Side Paginated Directory via TanStack Query
- Navigation through 10,000 records using pagination (`LIMIT` and `OFFSET` queries), defaulting to 20 records per page.
- Supports keyword search (mapping strings to Employee Name or Employee ID) and multi-select filtering (by Country and Department).
- TanStack Query matches parameters with server state for caching and smooth UI indicators.

### Feature 5: Salary Modification Workflow
- Secures salary modification modal for HR managers to update records.
- Strict Zod schema validation checks parameters, rejecting negative numbers or malformed inputs with HTTP 400 Bad Request.
- TanStack Query mutation invalidates cache upon success, immediately updating dashboard and directory views.

---

## 4. System Data Modeling (Drizzle Relational Schema)

1. **Users Table (`users`)**
   - `id`: Text, Primary Key
   - `username`: Text, Unique, Not Null
   - `passwordHash`: Text, Not Null

2. **Employees Table (`employees`)**
   - `id`: Text, Primary Key
   - `employeeId`: Text, Unique, Not Null
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
   - `baseSalary`: Integer, Not Null (Stored as cents/paise)
   - `bonus`: Integer, Default 0
   - `allowances`: Integer, Default 0
   - `deductions`: Integer, Default 0
   - `updatedAt`: Timestamp, Default Now
