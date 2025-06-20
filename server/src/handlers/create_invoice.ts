
import { db } from '../db';
import { invoicesTable } from '../db/schema';
import { type CreateInvoiceInput, type Invoice } from '../schema';

export const createInvoice = async (input: CreateInvoiceInput): Promise<Invoice> => {
  try {
    // Insert invoice record
    const result = await db.insert(invoicesTable)
      .values({
        client_name: input.client_name,
        description: input.description,
        amount: input.amount.toString(), // Convert number to string for numeric column
        issue_date: input.issue_date,
        due_date: input.due_date,
        status: input.status
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const invoice = result[0];
    return {
      ...invoice,
      amount: parseFloat(invoice.amount) // Convert string back to number
    };
  } catch (error) {
    console.error('Invoice creation failed:', error);
    throw error;
  }
};
