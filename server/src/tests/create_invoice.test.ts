
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { invoicesTable } from '../db/schema';
import { type CreateInvoiceInput } from '../schema';
import { createInvoice } from '../handlers/create_invoice';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateInvoiceInput = {
  client_name: 'Test Client',
  description: 'Test invoice description',
  amount: 1500.00,
  issue_date: new Date('2024-01-15'),
  due_date: new Date('2024-02-15'),
  status: 'Pending'
};

describe('createInvoice', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an invoice', async () => {
    const result = await createInvoice(testInput);

    // Basic field validation
    expect(result.client_name).toEqual('Test Client');
    expect(result.description).toEqual('Test invoice description');
    expect(result.amount).toEqual(1500.00);
    expect(typeof result.amount).toBe('number');
    expect(result.issue_date).toEqual(new Date('2024-01-15'));
    expect(result.due_date).toEqual(new Date('2024-02-15'));
    expect(result.status).toEqual('Pending');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save invoice to database', async () => {
    const result = await createInvoice(testInput);

    // Query using proper drizzle syntax
    const invoices = await db.select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, result.id))
      .execute();

    expect(invoices).toHaveLength(1);
    expect(invoices[0].client_name).toEqual('Test Client');
    expect(invoices[0].description).toEqual('Test invoice description');
    expect(parseFloat(invoices[0].amount)).toEqual(1500.00);
    expect(invoices[0].issue_date).toEqual(new Date('2024-01-15'));
    expect(invoices[0].due_date).toEqual(new Date('2024-02-15'));
    expect(invoices[0].status).toEqual('Pending');
    expect(invoices[0].created_at).toBeInstanceOf(Date);
  });

  it('should use default status when not provided', async () => {
    const inputWithoutStatus = {
      client_name: 'Test Client',
      description: 'Test invoice description',
      amount: 1500.00,
      issue_date: new Date('2024-01-15'),
      due_date: new Date('2024-02-15')
    } as CreateInvoiceInput;

    const result = await createInvoice(inputWithoutStatus);

    expect(result.status).toEqual('Pending');
  });

  it('should handle different invoice statuses', async () => {
    const paidInvoiceInput: CreateInvoiceInput = {
      ...testInput,
      status: 'Paid'
    };

    const result = await createInvoice(paidInvoiceInput);

    expect(result.status).toEqual('Paid');

    // Verify in database
    const invoices = await db.select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, result.id))
      .execute();

    expect(invoices[0].status).toEqual('Paid');
  });

  it('should handle decimal amounts correctly', async () => {
    const decimalInput: CreateInvoiceInput = {
      ...testInput,
      amount: 1234.56
    };

    const result = await createInvoice(decimalInput);

    expect(result.amount).toEqual(1234.56);
    expect(typeof result.amount).toBe('number');

    // Verify precision is maintained in database
    const invoices = await db.select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, result.id))
      .execute();

    expect(parseFloat(invoices[0].amount)).toEqual(1234.56);
  });
});
