import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

// Roles table
export const rolesTable = pgTable("roles", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g. 'admin', 'commercial', 'finance', 'warehouse', 'driver'
  name: text("name").notNull(),
  description: text("description"),
  permissions: text("permissions").notNull(), // JSON string array of permissions
});

export type Role = typeof rolesTable.$inferSelect;

// Users table
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  roleCode: text("role_code").notNull().default("admin"),
  city: text("city"),
  status: text("status").notNull().default("Actif"),
});

export type User = typeof usersTable.$inferSelect;

// ERP Records Generic Schema for Modules: Orders, Products, Inventory, Customers, Purchasing, Deliveries, Finance, Settings, Reports
export const erpRecordsTable = pgTable("erp_records", {
  id: serial("id").primaryKey(),
  module: text("module").notNull(), // 'orders', 'products', 'inventory', 'customers', 'purchasing', 'deliveries', 'finance', 'reports', 'settings'
  ref: text("ref").notNull(),
  customer: text("customer").notNull(),
  city: text("city").notNull(),
  date: text("date").notNull(),
  total: text("total").notNull(),
  status: text("status").notNull(),
  source: text("source").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ErpRecord = typeof erpRecordsTable.$inferSelect;
