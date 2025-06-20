
import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type UpdateExpenseInput, type Expense } from '../schema';
import { eq } from 'drizzle-orm';

export const updateExpense = async (input: UpdateExpenseInput): Promise<Expense> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.amount !== undefined) {
      updateData.amount = input.amount.toString(); // Convert number to string for numeric column
    }
    if (input.date !== undefined) {
      updateData.date = input.date;
    }
    if (input.category !== undefined) {
      updateData.category = input.category;
    }

    // Update expense record
    const result = await db.update(expensesTable)
      .set(updateData)
      .where(eq(expensesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Expense with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const expense = result[0];
    return {
      ...expense,
      amount: parseFloat(expense.amount) // Convert string back to number
    };
  } catch (error) {
    console.error('Expense update failed:', error);
    throw error;
  }
};
