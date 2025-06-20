
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Invoice, Expense, DashboardStats, CreateInvoiceInput, CreateExpenseInput, UpdateInvoiceInput, UpdateExpenseInput, InvoiceStatus, ExpenseCategory } from '../../server/src/schema';

function App() {
  // State management
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dialog states
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form states
  const [invoiceForm, setInvoiceForm] = useState<CreateInvoiceInput>({
    client_name: '',
    description: '',
    amount: 0,
    issue_date: new Date(),
    due_date: new Date(),
    status: 'Pending'
  });

  const [expenseForm, setExpenseForm] = useState<CreateExpenseInput>({
    description: '',
    amount: 0,
    date: new Date(),
    category: 'Other'
  });

  // Data loading functions
  const loadDashboard = useCallback(async () => {
    try {
      const stats = await trpc.getDashboardStats.query();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  }, []);

  const loadInvoices = useCallback(async () => {
    try {
      const result = await trpc.getInvoices.query();
      setInvoices(result);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    }
  }, []);

  const loadExpenses = useCallback(async () => {
    try {
      const result = await trpc.getExpenses.query();
      setExpenses(result);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([loadDashboard(), loadInvoices(), loadExpenses()]);
  }, [loadDashboard, loadInvoices, loadExpenses]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Invoice handlers
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newInvoice = await trpc.createInvoice.mutate(invoiceForm);
      setInvoices((prev: Invoice[]) => [...prev, newInvoice]);
      setInvoiceForm({
        client_name: '',
        description: '',
        amount: 0,
        issue_date: new Date(),
        due_date: new Date(),
        status: 'Pending'
      });
      setIsInvoiceDialogOpen(false);
      await loadDashboard(); // Refresh dashboard stats
    } catch (error) {
      console.error('Failed to create invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateInvoiceInput = {
        id: editingInvoice.id,
        client_name: invoiceForm.client_name,
        description: invoiceForm.description,
        amount: invoiceForm.amount,
        issue_date: invoiceForm.issue_date,
        due_date: invoiceForm.due_date,
        status: invoiceForm.status
      };
      
      const updatedInvoice = await trpc.updateInvoice.mutate(updateData);
      setInvoices((prev: Invoice[]) => 
        prev.map((inv: Invoice) => inv.id === updatedInvoice.id ? updatedInvoice : inv)
      );
      setEditingInvoice(null);
      setIsInvoiceDialogOpen(false);
      await loadDashboard(); // Refresh dashboard stats
    } catch (error) {
      console.error('Failed to update invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Expense handlers
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newExpense = await trpc.createExpense.mutate(expenseForm);
      setExpenses((prev: Expense[]) => [...prev, newExpense]);
      setExpenseForm({
        description: '',
        amount: 0,
        date: new Date(),
        category: 'Other'
      });
      setIsExpenseDialogOpen(false);
      await loadDashboard(); // Refresh dashboard stats
    } catch (error) {
      console.error('Failed to create expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateExpenseInput = {
        id: editingExpense.id,
        description: expenseForm.description,
        amount: expenseForm.amount,
        date: expenseForm.date,
        category: expenseForm.category
      };
      
      const updatedExpense = await trpc.updateExpense.mutate(updateData);
      setExpenses((prev: Expense[]) => 
        prev.map((exp: Expense) => exp.id === updatedExpense.id ? updatedExpense : exp)
      );
      setEditingExpense(null);
      setIsExpenseDialogOpen(false);
      await loadDashboard(); // Refresh dashboard stats
    } catch (error) {
      console.error('Failed to update expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit handlers
  const openEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setInvoiceForm({
      client_name: invoice.client_name,
      description: invoice.description,
      amount: invoice.amount,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      status: invoice.status
    });
    setIsInvoiceDialogOpen(true);
  };

  const openEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      category: expense.category
    });
    setIsExpenseDialogOpen(true);
  };

  const closeInvoiceDialog = () => {
    setIsInvoiceDialogOpen(false);
    setEditingInvoice(null);
    setInvoiceForm({
      client_name: '',
      description: '',
      amount: 0,
      issue_date: new Date(),
      due_date: new Date(),
      status: 'Pending'
    });
  };

  const closeExpenseDialog = () => {
    setIsExpenseDialogOpen(false);
    setEditingExpense(null);
    setExpenseForm({
      description: '',
      amount: 0,
      date: new Date(),
      category: 'Other'
    });
  };

  // Utility functions
  const getStatusBadgeVariant = (status: InvoiceStatus): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Pending': return 'secondary';
      case 'Overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const getCategoryBadgeVariant = (): "default" | "destructive" | "outline" | "secondary" => {
    return 'outline';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💼 Freelancer Dashboard</h1>
          <p className="text-gray-600">Track your invoices and expenses with ease</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="invoices">📋 Invoices</TabsTrigger>
            <TabsTrigger value="expenses">💸 Expenses</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {dashboardStats && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <span className="text-green-600">💰</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(dashboardStats.total_income)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <span className="text-red-600">💸</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(dashboardStats.total_expenses)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                    <span className="text-blue-600">📈</span>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${dashboardStats.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(dashboardStats.net_income)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                    <span className="text-yellow-600">⏳</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {dashboardStats.pending_invoices_count}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
                    <span className="text-red-600">⚠️</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {dashboardStats.overdue_invoices_count}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Your latest invoice activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {invoices.slice(0, 5).map((invoice: Invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{invoice.client_name}</p>
                        <p className="text-sm text-gray-500">{invoice.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                        <Badge variant={getStatusBadgeVariant(invoice.status)} className="text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {invoices.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No invoices yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Expenses</CardTitle>
                  <CardDescription>Your latest expense activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {expenses.slice(0, 5).map((expense: Expense) => (
                    <div key={expense.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <Badge variant={getCategoryBadgeVariant()} className="text-xs">
                          {expense.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(expense.amount)}</p>
                        <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                      </div>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No expenses yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Invoices</h2>
              <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsInvoiceDialogOpen(true)}>
                    ➕ New Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingInvoice ? '✏️ Edit Invoice' : '➕ Create New Invoice'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingInvoice ? 'Update invoice details below.' : 'Fill in the invoice details below.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="client_name" className="text-right">
                          Client Name
                        </Label>
                        <Input
                          id="client_name"
                          value={invoiceForm.client_name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setInvoiceForm((prev: CreateInvoiceInput) => ({ ...prev, client_name: e.target.value }))
                          }
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Input
                          id="description"
                          value={invoiceForm.description}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setInvoiceForm((prev: CreateInvoiceInput) => ({ ...prev, description: e.target.value }))
                          }
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                          Amount
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={invoiceForm.amount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setInvoiceForm((prev: CreateInvoiceInput) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
                          }
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="issue_date" className="text-right">
                          Issue Date
                        </Label>
                        <Input
                          id="issue_date"
                          type="date"
                          value={invoiceForm.issue_date.toISOString().split('T')[0]}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setInvoiceForm((prev: CreateInvoiceInput) => ({ ...prev, issue_date: new Date(e.target.value) }))
                          }
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="due_date" className="text-right">
                          Due Date
                        </Label>
                        <Input
                          id="due_date"
                          type="date"
                          value={invoiceForm.due_date.toISOString().split('T')[0]}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setInvoiceForm((prev: CreateInvoiceInput) => ({ ...prev, due_date: new Date(e.target.value) }))
                          }
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                          Status
                        </Label>
                        <Select
                          value={invoiceForm.status || 'Pending'}
                          onValueChange={(value: InvoiceStatus) =>
                            setInvoiceForm((prev: CreateInvoiceInput) => ({ ...prev, status: value }))
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={closeInvoiceDialog}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (editingInvoice ? 'Update Invoice' : 'Create Invoice')}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {invoices.map((invoice: Invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{invoice.client_name}</h3>
                          <Badge variant={getStatusBadgeVariant(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{invoice.description}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Issued: {formatDate(invoice.issue_date)}</span>
                          <span>Due: {formatDate(invoice.due_date)}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold">{formatCurrency(invoice.amount)}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditInvoice(invoice)}
                        >
                          ✏️ Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {invoices.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <p>No invoices yet. Create your first invoice to get started! 📋</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Expenses</h2>
              <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsExpenseDialogOpen(true)}>
                    ➕ New Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingExpense ? '✏️ Edit Expense' : '➕ Create New Expense'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingExpense ? 'Update expense details below.' : 'Fill in the expense details below.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="exp_description" className="text-right">
                          Description
                        </Label>
                        <Input
                          id="exp_description"
                          value={expenseForm.description}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setExpenseForm((prev: CreateExpenseInput) => ({ ...prev, description: e.target.value }))
                          }
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="exp_amount" className="text-right">
                          Amount
                        </Label>
                        <Input
                          id="exp_amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={expenseForm.amount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setExpenseForm((prev: CreateExpenseInput) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
                          }
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="exp_date" className="text-right">
                          Date
                        </Label>
                        <Input
                          id="exp_date"
                          type="date"
                          value={expenseForm.date.toISOString().split('T')[0]}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setExpenseForm((prev: CreateExpenseInput) => ({ ...prev, date: new Date(e.target.value) }))
                          }
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                          Category
                        </Label>
                        <Select
                          value={expenseForm.category || 'Other'}
                          onValueChange={(value: ExpenseCategory) =>
                            setExpenseForm((prev: CreateExpenseInput) => ({ ...prev, category: value }))
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Software">Software</SelectItem>
                            <SelectItem value="Travel">Travel</SelectItem>
                            <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={closeExpenseDialog}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Create Expense')}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {expenses.map((expense: Expense) => (
                <Card key={expense.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{expense.description}</h3>
                          <Badge variant={getCategoryBadgeVariant()}>
                            {expense.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Date: {formatDate(expense.date)}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold text-red-600">
                          -{formatCurrency(expense.amount)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditExpense(expense)}
                        >
                          ✏️ Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {expenses.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <p>No expenses yet. Add your first expense to get started! 💸</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
