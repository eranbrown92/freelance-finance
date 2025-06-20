
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { invoicesTable } from '../db/schema';
import { type CreateInvoiceInput } from '../schema';
import { getInvoices } from '../handlers/get_invoices';

// Test invoice data
const testInvoice1: CreateInvoiceInput = {
  client_name: 'Acme Corp',
  description: 'Web development services',
  amount: 2500.00,
  issue_date: new Date('2024-01-15'),
  due_date: new Date('2024-02-15'),
  status: 'Pending'
};

const testInvoice2: CreateInvoiceInput = {
  client_name: 'Tech Solutions',
  description: 'Mobile app development',
  amount: 5000.50,
  issue_date: new Date('2024-01-20'),
  due_date: new Date('2024-02-20'),
  status: 'Paid'
};

describe('getInvoices', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no invoices exist', async () => {
    const result = await getInvoices();
    
    expect(result).toEqual([]);
  });

  it('should return all invoices', async () => {
    // Create test invoices
    await db.insert(invoicesTable)
      .values([
        {
          client_name: testInvoice1.client_name,
          description: testInvoice1.description,
          amount: testInvoice1.amount.toString(),
          issue_date: testInvoice1.issue_date,
          due_date: testInvoice1.due_date,
          status: testInvoice1.status
        },
        {
          client_name: testInvoice2.client_name,
          description: testInvoice2.description,
          amount: testInvoice2.amount.toString(),
          issue_date: testInvoice2.issue_date,
          due_date: testInvoice2.due_date,
          status: testInvoice2.status
        }
      ])
      .execute();

    const result = await getInvoices();

    expect(result).toHaveLength(2);
    
    // Check first invoice
    const invoice1 = result.find(inv => inv.client_name === 'Acme Corp');
    expect(invoice1).toBeDefined();
    expect(invoice1!.description).toEqual('Web development services');
    expect(invoice1!.amount).toEqual(2500.00);
    expect(typeof invoice1!.amount).toBe('number');
    expect(invoice1!.status).toEqual('Pending');
    expect(invoice1!.id).toBeDefined();
    expect(invoice1!.created_at).toBeInstanceOf(Date);

    // Check second invoice
    const invoice2 = result.find(inv => inv.client_name === 'Tech Solutions');
    expect(invoice2).toBeDefined();
    expect(invoice2!.description).toEqual('Mobile app development');
    expect(invoice2!.amount).toEqual(5000.50);
    expect(typeof invoice2!.amount).toBe('number');
    expect(invoice2!.status).toEqual('Paid');
    expect(invoice2!.id).toBeDefined();
    expect(invoice2!.created_at).toBeInstanceOf(Date);
  });

  it('should handle numeric conversion correctly', async () => {
    // Create invoice with decimal amount
    await db.insert(invoicesTable)
      .values({
        client_name: 'Test Client',
        description: 'Test service',
        amount: '1234.56',
        issue_date: new Date(),
        due_date: new Date(),
        status: 'Pending'
      })
      .execute();

    const result = await getInvoices();

    expect(result).toHaveLength(1);
    expect(result[0].amount).toEqual(1234.56);
    expect(typeof result[0].amount).toBe('number');
  });
});
