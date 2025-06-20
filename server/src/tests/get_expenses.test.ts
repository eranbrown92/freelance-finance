
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type CreateExpenseInput } from '../schema';
import { getExpenses } from '../handlers/get_expenses';

// Test expense data
const testExpenses: CreateExpenseInput[] = [
  {
    description: 'Office Supplies Purchase',
    amount: 125.50,
    date: new Date('2024-01-15'),
    category: 'Office Supplies'
  },
  {
    description: 'Marketing Campaign',
    amount: 500.00,
    date: new Date('2024-01-20'),
    category: 'Marketing'
  },
  {
    description: 'Software License',
    amount: 99.99,
    date: new Date('2024-01-25'),
    category: 'Software'
  }
];

describe('getExpenses', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no expenses exist', async () => {
    const result = await getExpenses();

    expect(result).toEqual([]);
  });

  it('should return all expenses', async () => {
    // Create test expenses
    await db.insert(expensesTable)
      .values(testExpenses.map(expense => ({
        ...expense,
        amount: expense.amount.toString() // Convert number to string for numeric column
      })))
      .execute();

    const result = await getExpenses();

    expect(result).toHaveLength(3);
    
    // Verify first expense
    const firstExpense = result.find(e => e.description === 'Office Supplies Purchase');
    expect(firstExpense).toBeDefined();
    expect(firstExpense!.amount).toEqual(125.50);
    expect(typeof firstExpense!.amount).toBe('number');
    expect(firstExpense!.category).toEqual('Office Supplies');
    expect(firstExpense!.date).toBeInstanceOf(Date);
    expect(firstExpense!.created_at).toBeInstanceOf(Date);
    expect(firstExpense!.id).toBeDefined();

    // Verify second expense
    const secondExpense = result.find(e => e.description === 'Marketing Campaign');
    expect(secondExpense).toBeDefined();
    expect(secondExpense!.amount).toEqual(500.00);
    expect(typeof secondExpense!.amount).toBe('number');
    expect(secondExpense!.category).toEqual('Marketing');

    // Verify third expense
    const thirdExpense = result.find(e => e.description === 'Software License');
    expect(thirdExpense).toBeDefined();
    expect(thirdExpense!.amount).toEqual(99.99);
    expect(typeof thirdExpense!.amount).toBe('number');
    expect(thirdExpense!.category).toEqual('Software');
  });

  it('should return expenses with correct field types', async () => {
    // Create single test expense
    await db.insert(expensesTable)
      .values({
        description: 'Test Expense',
        amount: '75.25', // Insert as string
        date: new Date('2024-01-10'),
        category: 'Travel'
      })
      .execute();

    const result = await getExpenses();

    expect(result).toHaveLength(1);
    const expense = result[0];
    
    // Verify all field types
    expect(typeof expense.id).toBe('number');
    expect(typeof expense.description).toBe('string');
    expect(typeof expense.amount).toBe('number'); // Should be converted from string
    expect(expense.date).toBeInstanceOf(Date);
    expect(typeof expense.category).toBe('string');
    expect(expense.created_at).toBeInstanceOf(Date);
    
    // Verify specific values
    expect(expense.description).toEqual('Test Expense');
    expect(expense.amount).toEqual(75.25);
    expect(expense.category).toEqual('Travel');
  });
});
