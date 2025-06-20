
import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type Expense } from '../schema';

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    // Query all expenses
    const results = await db.select()
      .from(expensesTable)
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(expense => ({
      ...expense,
      amount: parseFloat(expense.amount) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to retrieve expenses:', error);
    throw error;
  }
};
