
import { db } from '../db';
import { invoicesTable, expensesTable } from '../db/schema';
import { type DashboardStats } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Calculate total income from paid invoices
    const totalIncomeResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${invoicesTable.amount}), 0)`
      })
      .from(invoicesTable)
      .where(eq(invoicesTable.status, 'Paid'))
      .execute();

    // Calculate total expenses
    const totalExpensesResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)`
      })
      .from(expensesTable)
      .execute();

    // Count pending invoices
    const pendingInvoicesResult = await db
      .select({
        count: sql<string>`COUNT(*)`
      })
      .from(invoicesTable)
      .where(eq(invoicesTable.status, 'Pending'))
      .execute();

    // Count overdue invoices
    const overdueInvoicesResult = await db
      .select({
        count: sql<string>`COUNT(*)`
      })
      .from(invoicesTable)
      .where(eq(invoicesTable.status, 'Overdue'))
      .execute();

    const totalIncome = parseFloat(totalIncomeResult[0].total);
    const totalExpenses = parseFloat(totalExpensesResult[0].total);
    const netIncome = totalIncome - totalExpenses;
    const pendingInvoicesCount = parseInt(pendingInvoicesResult[0].count);
    const overdueInvoicesCount = parseInt(overdueInvoicesResult[0].count);

    return {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_income: netIncome,
      pending_invoices_count: pendingInvoicesCount,
      overdue_invoices_count: overdueInvoicesCount
    };
  } catch (error) {
    console.error('Dashboard stats calculation failed:', error);
    throw error;
  }
};
