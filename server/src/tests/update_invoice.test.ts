
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { invoicesTable } from '../db/schema';
import { type CreateInvoiceInput, type UpdateInvoiceInput } from '../schema';
import { updateInvoice } from '../handlers/update_invoice';
import { eq } from 'drizzle-orm';

// Test data
const createInvoiceInput: CreateInvoiceInput = {
  client_name: 'Test Client',
  description: 'Initial invoice',
  amount: 100.00,
  issue_date: new Date('2024-01-01'),
  due_date: new Date('2024-01-31'),
  status: 'Pending'
};

describe('updateInvoice', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all invoice fields', async () => {
    // Create initial invoice
    const created = await db.insert(invoicesTable)
      .values({
        ...createInvoiceInput,
        amount: createInvoiceInput.amount.toString()
      })
      .returning()
      .execute();

    const invoiceId = created[0].id;

    // Update all fields
    const updateInput: UpdateInvoiceInput = {
      id: invoiceId,
      client_name: 'Updated Client',
      description: 'Updated description',
      amount: 250.75,
      issue_date: new Date('2024-02-01'),
      due_date: new Date('2024-02-28'),
      status: 'Paid'
    };

    const result = await updateInvoice(updateInput);

    expect(result.id).toEqual(invoiceId);
    expect(result.client_name).toEqual('Updated Client');
    expect(result.description).toEqual('Updated description');
    expect(result.amount).toEqual(250.75);
    expect(typeof result.amount).toEqual('number');
    expect(result.issue_date).toEqual(new Date('2024-02-01'));
    expect(result.due_date).toEqual(new Date('2024-02-28'));
    expect(result.status).toEqual('Paid');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update partial invoice fields', async () => {
    // Create initial invoice
    const created = await db.insert(invoicesTable)
      .values({
        ...createInvoiceInput,
        amount: createInvoiceInput.amount.toString()
      })
      .returning()
      .execute();

    const invoiceId = created[0].id;

    // Update only status and amount
    const updateInput: UpdateInvoiceInput = {
      id: invoiceId,
      status: 'Overdue',
      amount: 150.50
    };

    const result = await updateInvoice(updateInput);

    expect(result.id).toEqual(invoiceId);
    expect(result.client_name).toEqual('Test Client'); // Should remain unchanged
    expect(result.description).toEqual('Initial invoice'); // Should remain unchanged
    expect(result.amount).toEqual(150.50);
    expect(typeof result.amount).toEqual('number');
    expect(result.status).toEqual('Overdue');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated invoice to database', async () => {
    // Create initial invoice
    const created = await db.insert(invoicesTable)
      .values({
        ...createInvoiceInput,
        amount: createInvoiceInput.amount.toString()
      })
      .returning()
      .execute();

    const invoiceId = created[0].id;

    // Update invoice
    const updateInput: UpdateInvoiceInput = {
      id: invoiceId,
      client_name: 'Database Test Client',
      amount: 999.99
    };

    await updateInvoice(updateInput);

    // Verify in database
    const invoices = await db.select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, invoiceId))
      .execute();

    expect(invoices).toHaveLength(1);
    expect(invoices[0].client_name).toEqual('Database Test Client');
    expect(parseFloat(invoices[0].amount)).toEqual(999.99);
    expect(invoices[0].description).toEqual('Initial invoice'); // Should remain unchanged
  });

  it('should throw error for non-existent invoice', async () => {
    const updateInput: UpdateInvoiceInput = {
      id: 99999,
      client_name: 'Non-existent'
    };

    await expect(updateInvoice(updateInput)).rejects.toThrow(/not found/i);
  });
});
