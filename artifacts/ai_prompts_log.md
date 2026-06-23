# AI Prompts Log: Structured Agent Collaboration

This log documents the behavioral instructions, specifications, and conversational prompt structures utilized to orchestrate and build this application.

---

## 1. System Prompts & Contextual Bounds
- **Identity**: Antigravity, Principal Software Engineer and Product Architect.
- **Rules**:
  - Implement full, operational files (strictly avoiding placeholders, shorthand comments, or `// TODO` items).
  - Strict directory and naming alignment mapping cleanly to Onion Architecture concentric directories.
  - Plain JavaScript (ES Modules, `import/export` syntax) matching Node.js backend.
  - React plain JavaScript with TanStack Query on client frontend.
  - Strict SQLite ORM schemas utilizing Drizzle.

---

## 2. Core Functional Directives Log

### Seeding & Chunking Directive
- *Prompt Pattern*: "Design an optimized seeding script `src/infrastructure/db/seed.js` to populate exactly 10,000 unique records. Leverage batching strategies of 1,000 records inside transactions to prevent SQLite locking."
- *Agent Response*: Built an index loop generating realistic first names, last names, emails, roles, and localized salaries, batch inserting them via `db.transaction()` groups of 1,000.

### Onion Architecture Alignment
- *Prompt Pattern*: "Structure directories separating business domain models, orchestration logic (use cases), data interfaces, concrete ORM database connections/repositories, and Fastify HTTP controllers/routing hooks."
- *Agent Response*: Built domain folders completely independent of libraries, and set up Fastify `api.js` using hooks (`authHook.js`) to guard controllers.

### Currency Precision Enforcement
- *Prompt Pattern*: "Store compensation column parameters as integer values representing paise/cents to prevent floating-point inaccuracies."
- *Agent Response*: Configured Zod verification schema to expect integer cents values, and created client multipliers to convert decimal inputs.

---

## 3. Iterative Refinement Log

### Search Matches Improvement
- *Feedback*: Searching for combined full names (e.g. `"Sunita Verma"`) returned zero results.
- *Prompt Pattern*: "Modify repository search logic to search for concatenated names so that queries matching first and last names together return correct indices."
- *Agent Response*: Modified `EmployeeRepositoryImpl.js` query conditions array, substituting single-column `like` fields with a Drizzle SQL template: `like(sql`\${employees.firstName} || ' ' || \${employees.lastName}\`, searchTerm)`.
