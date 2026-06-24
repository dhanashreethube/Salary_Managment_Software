import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
});

export const employees = sqliteTable("employees", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id").unique().notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique().notNull(),
  department: text("department").notNull(),
  role: text("role").notNull(),
  country: text("country").notNull(),
  currency: text("currency").notNull(),
  joiningDate: text("joining_date").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
});

export const compensation = sqliteTable("compensation", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  baseSalary: integer("base_salary").notNull(),
  bonus: integer("bonus").default(0).notNull(),
  allowances: integer("allowances").default(0).notNull(),
  deductions: integer("deductions").default(0).notNull(),
  comment: text("comment"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
});
