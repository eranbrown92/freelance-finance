
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type CreateExpenseInput } from '../schema';
import { createExpense } from '../handlers/create_expense';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateExpenseInput = {
  description: 'Test Office Supplies',
  amount: 49.99,
  date: new Date('2024-01-15'),
  category: 'Office Supplies'
};

describe('createExpense', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an expense', async () => {
    const result = await createExpense(testInput);

    // Basic field validation
    expect(result.description).toEqual('Test Office Supplies');
    expect(result.amount).toEqual(49.99);
    expect(typeof result.amount).toBe('number');
    expect(result.date).toEqual(new Date('2024-01-15'));
    expect(result.category).toEqual('Office Supplies');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save expense to database', async () => {
    const result = await createExpense(testInput);

    // Query using proper drizzle syntax
    const expenses = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.id, result.id))
      .execute();

    expect(expenses).toHaveLength(1);
    expect(expenses[0].description).toEqual('Test Office Supplies');
    expect(parseFloat(expenses[0].amount)).toEqual(49.99);
    expect(expenses[0].date).toEqual(new Date('2024-01-15'));
    expect(expenses[0].category).toEqual('Office Supplies');
    expect(expenses[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different expense categories', async () => {
    const categories = ['Software', 'Travel', 'Office Supplies', 'Marketing', 'Other'] as const;
    
    for (const category of categories) {
      const input: CreateExpenseInput = {
        description: `Test ${category} expense`,
        amount: 100.00,
        date: new Date('2024-01-15'),
        category: category
      };

      const result = await createExpense(input);
      expect(result.category).toEqual(category);
      expect(result.description).toEqual(`Test ${category} expense`);
    }
  });

  it('should handle different amount values', async () => {
    const amounts = [0.01, 10.50, 999.99, 1000.00];
    
    for (const amount of amounts) {
      const input: CreateExpenseInput = {
        description: 'Test expense',
        amount: amount,
        date: new Date('2024-01-15'),
        category: 'Other'
      };

      const result = await createExpense(input);
      expect(result.amount).toEqual(amount);
      expect(typeof result.amount).toBe('number');
    }
  });
});
