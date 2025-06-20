
import { z } from 'zod';

// Invoice status enum
export const invoiceStatusEnum = z.enum(['Pending', 'Paid', 'Overdue']);
export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>;

// Expense category enum
export const expenseCategoryEnum = z.enum(['Software', 'Travel', 'Office Supplies', 'Marketing', 'Other']);
export type ExpenseCategory = z.infer<typeof expenseCategoryEnum>;

// Invoice schema
export const invoiceSchema = z.object({
  id: z.number(),
  client_name: z.string(),
  description: z.string(),
  amount: z.number(),
  issue_date: z.coerce.date(),
  due_date: z.coerce.date(),
  status: invoiceStatusEnum,
  created_at: z.coerce.date()
});

export type Invoice = z.infer<typeof invoiceSchema>;

// Input schema for creating invoices
export const createInvoiceInputSchema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  issue_date: z.coerce.date(),
  due_date: z.coerce.date(),
  status: invoiceStatusEnum.default('Pending')
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceInputSchema>;

// Input schema for updating invoices
export const updateInvoiceInputSchema = z.object({
  id: z.number(),
  client_name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  issue_date: z.coerce.date().optional(),
  due_date: z.coerce.date().optional(),
  status: invoiceStatusEnum.optional()
});

export type UpdateInvoiceInput = z.infer<typeof updateInvoiceInputSchema>;

// Expense schema
export const expenseSchema = z.object({
  id: z.number(),
  description: z.string(),
  amount: z.number(),
  date: z.coerce.date(),
  category: expenseCategoryEnum,
  created_at: z.coerce.date()
});

export type Expense = z.infer<typeof expenseSchema>;

// Input schema for creating expenses
export const createExpenseInputSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.coerce.date(),
  category: expenseCategoryEnum
});

export type CreateExpenseInput = z.infer<typeof createExpenseInputSchema>;

// Input schema for updating expenses
export const updateExpenseInputSchema = z.object({
  id: z.number(),
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  date: z.coerce.date().optional(),
  category: expenseCategoryEnum.optional()
});

export type UpdateExpenseInput = z.infer<typeof updateExpenseInputSchema>;

// Dashboard stats schema
export const dashboardStatsSchema = z.object({
  total_income: z.number(),
  total_expenses: z.number(),
  net_income: z.number(),
  pending_invoices_count: z.number(),
  overdue_invoices_count: z.number()
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
