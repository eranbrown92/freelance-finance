
import { serial, text, pgTable, timestamp, numeric, pgEnum } from 'drizzle-orm/pg-core';

// Define enums
export const invoiceStatusEnum = pgEnum('invoice_status', ['Pending', 'Paid', 'Overdue']);
export const expenseCategoryEnum = pgEnum('expense_category', ['Software', 'Travel', 'Office Supplies', 'Marketing', 'Other']);

// Invoices table
export const invoicesTable = pgTable('invoices', {
  id: serial('id').primaryKey(),
  client_name: text('client_name').notNull(),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  issue_date: timestamp('issue_date').notNull(),
  due_date: timestamp('due_date').notNull(),
  status: invoiceStatusEnum('status').notNull().default('Pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Expenses table
export const expensesTable = pgTable('expenses', {
  id: serial('id').primaryKey(),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date').notNull(),
  category: expenseCategoryEnum('category').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript types for the tables
export type Invoice = typeof invoicesTable.$inferSelect;
export type NewInvoice = typeof invoicesTable.$inferInsert;
export type Expense = typeof expensesTable.$inferSelect;
export type NewExpense = typeof expensesTable.$inferInsert;

// Export all tables for proper query building
export const tables = { 
  invoices: invoicesTable,
  expenses: expensesTable
};
