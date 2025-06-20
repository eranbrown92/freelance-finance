
import { db } from '../db';
import { invoicesTable } from '../db/schema';
import { type Invoice } from '../schema';

export const getInvoices = async (): Promise<Invoice[]> => {
  try {
    const results = await db.select()
      .from(invoicesTable)
      .execute();

    // Convert numeric fields back to numbers
    return results.map(invoice => ({
      ...invoice,
      amount: parseFloat(invoice.amount)
    }));
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    throw error;
  }
};
