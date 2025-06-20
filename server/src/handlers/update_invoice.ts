
import { db } from '../db';
import { invoicesTable } from '../db/schema';
import { type UpdateInvoiceInput, type Invoice } from '../schema';
import { eq } from 'drizzle-orm';

export const updateInvoice = async (input: UpdateInvoiceInput): Promise<Invoice> => {
  try {
    // Build update object with only defined fields
    const updateData: Record<string, any> = {};
    
    if (input.client_name !== undefined) {
      updateData['client_name'] = input.client_name;
    }
    if (input.description !== undefined) {
      updateData['description'] = input.description;
    }
    if (input.amount !== undefined) {
      updateData['amount'] = input.amount.toString(); // Convert number to string for numeric column
    }
    if (input.issue_date !== undefined) {
      updateData['issue_date'] = input.issue_date;
    }
    if (input.due_date !== undefined) {
      updateData['due_date'] = input.due_date;
    }
    if (input.status !== undefined) {
      updateData['status'] = input.status;
    }

    // Update invoice record
    const result = await db.update(invoicesTable)
      .set(updateData)
      .where(eq(invoicesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Invoice with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const invoice = result[0];
    return {
      ...invoice,
      amount: parseFloat(invoice.amount) // Convert string back to number
    };
  } catch (error) {
    console.error('Invoice update failed:', error);
    throw error;
  }
};
