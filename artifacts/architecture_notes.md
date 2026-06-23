# Technical Architecture Notes: Onion Architecture Rationale

## 1. Dependency Flow & Separation of Concerns
This project implements a strict **Onion Architecture** (also known as Clean Architecture) design. In this architectural pattern, the system is built around a completely independent, core Business Domain Layer. Dependencies flow inward toward the center, meaning that inner layers have zero knowledge of outer layers (like databases, web framework routers, logging tools, or authentication mechanisms).

```
   ┌─────────────────────────────────────────────────────────────┐
   │                  Presentation Layer (Fastify)               │
   │   ┌─────────────────────────────────────────────────────┐   │
   │   │             Infrastructure Layer (Drizzle/JWT)      │   │
   │   │   ┌─────────────────────────────────────────────┐   │   │
   │   │   │       Application Layer (Use Cases)         │   │   │
   │   │   │   ┌─────────────────────────────────────┐   │   │   │
   │   │   │   │        Domain Layer (Entities)      │   │   │   │
   │   │   │   │                                     │   │   │   │
   │   │   │   │              [CENTER]               │   │   │   │
   │   │   │   │      Pure JS, zero dependencies     │   │   │   │
   │   │   │   └─────────────────────────────────────┘   │   │   │
   │   │   └─────────────────────────────────────────────┘   │   │
   │   └─────────────────────────────────────────────────────┘   │
   └─────────────────────────────────────────────────────────────┘
                        Dependency Inward Flow:
             Presentation ──> Infrastructure ──> Application ──> Domain
```

---

## 2. Detailed concentric Layers

### Core Domain Layer (`src/domain/`)
- **Entities (`src/domain/entities/`)**: Holds the enterprise business rules and object factories (e.g. `Employee.js`, `Salary.js`). These objects are represented as pure JavaScript structures containing logic constraints (e.g., base salaries must be positive integers).
- **Interfaces (`src/domain/interfaces/`)**: Defines structural expectations (repository contracts such as `IEmployeeRepository.js`) via JSDoc or abstract classes.

### Application Layer (`src/application/`)
- **Use Cases (`src/application/use-cases/`)**: orchestrates actions and represents the operational business workflows of the system (e.g., `ListEmployees.js`, `UpdateSalary.js`, `GetMetrics.js`). Use cases act as handlers; they receive inputs, interact with repositories through domain interface contracts, run validations, and pass back structures. They do not know whether the data is coming from a local SQLite db or an external web service.

### Infrastructure Layer (`src/infrastructure/`)
- **DB Connection and Schema (`src/infrastructure/db/`)**: Houses connection drivers and the Drizzle ORM layout configurations.
- **Repositories (`src/infrastructure/repositories/`)**: Contains concrete data access repositories (e.g., `EmployeeRepositoryImpl.js`) that implement the contracts defined in the Domain layer.
- **Auth Service (`src/infrastructure/auth/`)**: Implements concrete authentication algorithms (e.g. JWT and bcrypt) to generate token payloads.

### Presentation Layer (`src/presentation/`)
- **Controllers & Routing (`src/presentation/controllers/`, `routes/`)**: maps incoming HTTP payloads to use cases. Fastify acts as the delivery mechanism, handling HTTP status codes (like 200, 400, or 401) and marshalling parameters.
- **Hooks (`src/presentation/hooks/`)**: Implements Fastify request hooks (middleware) such as `authHook.js` to protect routes.

---

## 3. Benefits: Sub-Second Isolated Unit Testing
By decoupling repositories and outer frameworks from the business logic:
- We can completely mock repository data layers using simple in-memory JavaScript stub functions.
- The unit tests running on Vitest (`npm run test`) run without connecting to SQLite or initializing a web server.
- This results in isolated, deterministic unit tests that run in **less than 500 milliseconds**, enabling rapid feedback loops during continuous integration.
