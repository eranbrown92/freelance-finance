
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type CreateExpenseInput, type UpdateExpenseInput } from '../schema';
import { updateExpense } from '../handlers/update_expense';
import { eq } from 'drizzle-orm';

// Test data
const testExpense: CreateExpenseInput = {
  description: 'Original Office Supplies',
  amount: 150.00,
  date: new Date('2024-01-15'),
  category: 'Office Supplies'
};

describe('updateExpense', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update expense fields', async () => {
    // Create initial expense
    const created = await db.insert(expensesTable)
      .values({
        description: testExpense.description,
        amount: testExpense.amount.toString(),
        date: testExpense.date,
        category: testExpense.category
      })
      .returning()
      .execute();

    const expenseId = created[0].id;

    // Update expense
    const updateInput: UpdateExpenseInput = {
      id: expenseId,
      description: 'Updated Software License',
      amount: 299.99,
      category: 'Software'
    };

    const result = await updateExpense(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(expenseId);
    expect(result.description).toEqual('Updated Software License');
    expect(result.amount).toEqual(299.99);
    expect(result.category).toEqual('Software');
    expect(result.date).toEqual(testExpense.date); // Should remain unchanged
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    // Create initial expense
    const created = await db.insert(expensesTable)
      .values({
        description: testExpense.description,
        amount: testExpense.amount.toString(),
        date: testExpense.date,
        category: testExpense.category
      })
      .returning()
      .execute();

    const expenseId = created[0].id;

    // Update only description
    const updateInput: UpdateExpenseInput = {
      id: expenseId,
      description: 'Partial Update Test'
    };

    const result = await updateExpense(updateInput);

    // Verify only description changed
    expect(result.description).toEqual('Partial Update Test');
    expect(result.amount).toEqual(150.00); // Should remain unchanged
    expect(result.category).toEqual('Office Supplies'); // Should remain unchanged
    expect(result.date).toEqual(testExpense.date); // Should remain unchanged
  });

  it('should save updated expense to database', async () => {
    // Create initial expense
    const created = await db.insert(expensesTable)
      .values({
        description: testExpense.description,
        amount: testExpense.amount.toString(),
        date: testExpense.date,
        category: testExpense.category
      })
      .returning()
      .execute();

    const expenseId = created[0].id;

    // Update expense
    const updateInput: UpdateExpenseInput = {
      id: expenseId,
      description: 'Marketing Campaign',
      amount: 500.00,
      category: 'Marketing'
    };

    await updateExpense(updateInput);

    // Verify changes persisted to database
    const expenses = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.id, expenseId))
      .execute();

    expect(expenses).toHaveLength(1);
    expect(expenses[0].description).toEqual('Marketing Campaign');
    expect(parseFloat(expenses[0].amount)).toEqual(500.00);
    expect(expenses[0].category).toEqual('Marketing');
  });

  it('should throw error for non-existent expense', async () => {
    const updateInput: UpdateExpenseInput = {
      id: 99999,
      description: 'Non-existent Expense'
    };

    await expect(updateExpense(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle date updates correctly', async () => {
    // Create initial expense
    const created = await db.insert(expensesTable)
      .values({
        description: testExpense.description,
        amount: testExpense.amount.toString(),
        date: testExpense.date,
        category: testExpense.category
      })
      .returning()
      .execute();

    const expenseId = created[0].id;
    const newDate = new Date('2024-02-20');

    // Update date
    const updateInput: UpdateExpenseInput = {
      id: expenseId,
      date: newDate
    };

    const result = await updateExpense(updateInput);

    expect(result.date).toEqual(newDate);
    expect(result.description).toEqual(testExpense.description); // Should remain unchanged
  });
});
