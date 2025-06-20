
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { invoicesTable, expensesTable } from '../db/schema';
import { getDashboardStats } from '../handlers/get_dashboard_stats';

describe('getDashboardStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero stats when no data exists', async () => {
    const result = await getDashboardStats();

    expect(result.total_income).toEqual(0);
    expect(result.total_expenses).toEqual(0);
    expect(result.net_income).toEqual(0);
    expect(result.pending_invoices_count).toEqual(0);
    expect(result.overdue_invoices_count).toEqual(0);
  });

  it('should calculate stats correctly with mixed data', async () => {
    // Create test invoices
    await db.insert(invoicesTable).values([
      {
        client_name: 'Client 1',
        description: 'Paid invoice',
        amount: '1000.00',
        issue_date: new Date(),
        due_date: new Date(),
        status: 'Paid'
      },
      {
        client_name: 'Client 2',
        description: 'Another paid invoice',
        amount: '500.50',
        issue_date: new Date(),
        due_date: new Date(),
        status: 'Paid'
      },
      {
        client_name: 'Client 3',
        description: 'Pending invoice',
        amount: '750.00',
        issue_date: new Date(),
        due_date: new Date(),
        status: 'Pending'
      },
      {
        client_name: 'Client 4',
        description: 'Overdue invoice',
        amount: '300.00',
        issue_date: new Date(),
        due_date: new Date(),
        status: 'Overdue'
      }
    ]).execute();

    // Create test expenses
    await db.insert(expensesTable).values([
      {
        description: 'Software license',
        amount: '200.00',
        date: new Date(),
        category: 'Software'
      },
      {
        description: 'Office supplies',
        amount: '150.75',
        date: new Date(),
        category: 'Office Supplies'
      }
    ]).execute();

    const result = await getDashboardStats();

    // Only paid invoices count toward total income
    expect(result.total_income).toEqual(1500.50); // 1000.00 + 500.50
    expect(result.total_expenses).toEqual(350.75); // 200.00 + 150.75
    expect(result.net_income).toEqual(1149.75); // 1500.50 - 350.75
    expect(result.pending_invoices_count).toEqual(1);
    expect(result.overdue_invoices_count).toEqual(1);
  });

  it('should handle negative net income', async () => {
    // Create small paid invoice
    await db.insert(invoicesTable).values({
      client_name: 'Small Client',
      description: 'Small payment',
      amount: '100.00',
      issue_date: new Date(),
      due_date: new Date(),
      status: 'Paid'
    }).execute();

    // Create large expense
    await db.insert(expensesTable).values({
      description: 'Large expense',
      amount: '500.00',
      date: new Date(),
      category: 'Other'
    }).execute();

    const result = await getDashboardStats();

    expect(result.total_income).toEqual(100);
    expect(result.total_expenses).toEqual(500);
    expect(result.net_income).toEqual(-400); // Negative net income
    expect(result.pending_invoices_count).toEqual(0);
    expect(result.overdue_invoices_count).toEqual(0);
  });

  it('should only count paid invoices in total income', async () => {
    // Create invoices with different statuses
    await db.insert(invoicesTable).values([
      {
        client_name: 'Client 1',
        description: 'Paid invoice',
        amount: '1000.00',
        issue_date: new Date(),
        due_date: new Date(),
        status: 'Paid'
      },
      {
        client_name: 'Client 2',
        description: 'Pending invoice - should not count',
        amount: '2000.00',
        issue_date: new Date(),
        due_date: new Date(),
        status: 'Pending'
      },
      {
        client_name: 'Client 3',
        description: 'Overdue invoice - should not count',
        amount: '3000.00',
        issue_date: new Date(),
        due_date: new Date(),
        status: 'Overdue'
      }
    ]).execute();

    const result = await getDashboardStats();

    // Only the paid invoice should count
    expect(result.total_income).toEqual(1000);
    expect(result.pending_invoices_count).toEqual(1);
    expect(result.overdue_invoices_count).toEqual(1);
  });
});
