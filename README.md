# Global Employee Salary Management System

A production-quality, end-to-end global compensation management portal for an organization of 10,000 employees. Built from scratch following a strict **Onion (Clean) Architecture** pattern using Node.js, Fastify, Drizzle ORM, SQLite, React, TanStack Query, and Tailwind CSS.

---

## 🚀 Getting Started & Testing

The local database automatically seeds a default administrative user account for easy evaluation.

- **Local URL:** `http://localhost:3000`
- **Username:** `admin`
- **Password:** `Password123`

---

## 🚀 Key Features

1. **JWT Session Authentication**: HR manager login sessions secured via HTTP-only cookies and protected routes guarded by a Fastify preHandler hook.
2. **Onion (Clean) Architecture**: Strict separation of concerns (Domain, Application, Infrastructure, Presentation) ensuring zero database or router dependencies inside core business rules.
3. **High-Performance Seeding Engine**: Algorithmic generation and transactional bulk insertion of exactly 10,000 unique records in chunks of 1,000 to prevent SQLite database locks.
4. **Interactive HR Dashboard**: Real-time business intelligence metrics including total run-rate (converted to USD equivalent), headcount counts by country, and average department spend.
5. **Server-Side Paginated Directory**: Fast, high-speed grid navigating 10,000 records with keyword searches and filters without causing browser latency.
6. **Zod Salary Modification**: Salary updates verified by Zod validation schemas to prevent floats, negative values, or malformed data.
7. **TanStack Query Caching & Mutations**: Server-state synchronization, instant cache invalidations, and smooth UI caching.
8. **Deterministic Unit Tests**: Sub-second test execution using mocked repositories (no db connection required).

---

## 📁 Repository Directory Structure

```
├── artifacts/              # Design docs, trade-offs, and architecture notes
├── src/                    # Backend Source Code (Onion Architecture layers)
│   ├── domain/             # Entities (Employee, Salary) and JSDoc Repository Interfaces
│   ├── application/        # Business workflows (ListEmployees, UpdateSalary, etc.)
│   ├── infrastructure/     # SQLite DB Connection, Drizzle schemas, seed engine, repos
│   ├── presentation/       # Fastify HTTP delivery layers (Routes, Hooks, Controllers)
│   └── server.js           # Server Bootstrap Entry Point
├── frontend/               # Client Frontend SPA (Vite + React + Tailwind v4)
├── tests/                  # Use Cases Unit tests (Vitest)
├── package.json            # Root project dependencies & scripts
├── drizzle.config.js       # Drizzle schema migrations configuration
└── salary_management.db    # SQLite Local Database (Auto-created)
```

---

## 🛠️ Quick Start Guide

### 1. Install Dependencies
Run from the root of the project to install all backend packages, then navigate to `frontend/` and install client dependencies:
```bash
npm install
cd frontend
npm install
cd ..
```

### 2. Setup Database & Seeding
Prepare the SQLite file, run Drizzle schema push, and execute the 10,000 records batch seeder:
```bash
npm run db:push
npm run db:seed
```

### 3. Run the Application
Start the Fastify backend server (serves the static frontend build in production):
```bash
npm start
```
*For active frontend/backend development with hot-reloading:*
1. Start backend: `npm run dev` (Starts on port `3000`)
2. Start Vite client: `cd frontend && npm run dev` (Starts on port `5173`, proxying `/api` requests to Fastify)

---

## 🔒 Pre-Seeded HR Credentials
Log in at `http://localhost:3000` using:
- **Username**: `admin`
- **Password**: `Password123`

---

## 🧪 Running Unit Tests
Execute the isolated use cases test suite using Vitest (completes in sub-second duration):
```bash
npm run test
```
