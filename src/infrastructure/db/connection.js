import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path in the root folder of the project
const dbPath = path.resolve(__dirname, "../../../salary_management.db");

const sqlite = new Database(dbPath);
// Enable foreign keys explicitly in SQLite
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export default db;
