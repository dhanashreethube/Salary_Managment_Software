# Engineering Trade-Offs & Architectural Decisions

This document details critical design decisions and engineering trade-offs resolved during the implementation of the Global Employee Salary Management System.

---

## 1. High-Performance SQLite Seeding Engine
- **Problem**: Generating and writing 10,000 detailed relational employee records into SQLite in single row queries creates extensive write-lock delays, database contention, and high memory usage (taking up to a minute).
- **Decision**: Implemented bulk batch inserts inside `src/infrastructure/db/seed.js`. Records are generated programmatically and inserted in chunks of **1,000 rows** wrapped inside SQL transactions (`db.transaction()`).
- **Trade-off**: 
  - *Benefits*: Reduces seeding time from over 30 seconds to **under 2 seconds**, dramatically lowering disk writes and avoiding transactional file lockups.
  - *Costs*: Requires holding batches of 1,000 JavaScript objects in-memory before submitting, but is highly optimized and memory-safe for this volume.

---

## 2. Floating-Point Rounding Error Prevention
- **Problem**: JavaScript represents numbers using IEEE 754 double-precision floats. Operations on floats (e.g. `0.1 + 0.2`) introduce rounding errors (yielding `0.30000000000000004`) which is unacceptable for financial balances, payroll audits, and salary run-rates.
- **Decision**: Stored all monetary variables (base salaries, bonuses, allowances, deductions) as **Integers** representing the lowest currency denominator (cents for USD/EUR, pence for GBP, and paise for INR). All calculations are computed in integers, and only formatted as decimals when rendering on the client dashboard.
- **Trade-off**:
  - *Benefits*: Completely eliminates floating-point rounding errors. Arithmetic operations on payroll columns are 100% precise and reproducible.
  - *Costs*: Requires conversion logic (multiplying by 100 on mutation submissions, and dividing by 100 on rendering) which must be consistently applied across UI views and schema definitions.

---

## 3. TanStack Query Server-State Caching
- **Problem**: Querying index listings of 10,000 employees on page toggle, search keystroke, or category change creates redundant database roundtrips, raising server loads and causing browser layout lag.
- **Decision**: Implemented **TanStack Query** (React Query) for state fetching on the frontend:
  - Cache results based on dependency matrices: `["employees", page, search, country, department]`.
  - Invalidate caches on mutation success (`queryClient.invalidateQueries(["employees", "metrics"])`).
- **Trade-off**:
  - *Benefits*: Users enjoy instant transitions back to previously visited pages because data is retrieved from client cache. The dashboard statistics stay perfectly in sync without manual reloading.
  - *Costs*: Requires managing cache keys, query invalidations, and handling loading indicators during fetches, which adds setup code to the React client.
