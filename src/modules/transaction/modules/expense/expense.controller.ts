import { Request, Response } from 'express';
import { logger } from '../../../../config/logger';
import { transactionService } from '../../transaction.service';
import { expenseService } from './expense.service';

const getExpenses = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;

  try {
    const expenses = await expenseService.getTenantExpenses(tenant);

    res.status(200).json(expenses);
  } catch (error) {
    logger.e(error, 'Failed to fetch expenses', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

const createExpense = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const data = req.body;

  const expenseDto = await expenseService.validateExpenseData(data);

  try {
    await expenseService.createExpense(expenseDto, tenant, user);

    const expenses = await expenseService.getTenantExpenses(tenant);
    const transactions = await transactionService.getTenantTransactions(tenant);

    res
      .status(201)
      .json({
        expenses,
        transactions,
        message: 'Expense created successfully',
      });
  } catch (error) {
    logger.e(error, 'Failed to create expense', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

const updateExpense = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const data = req.body;

  const expenseDto = await expenseService.validateExpenseData(data);

  try {
    await expenseService.updateExpense(expenseDto, tenant, user);
    const expenses = await expenseService.getTenantExpenses(tenant);
    const transactions = await transactionService.getTenantTransactions(tenant);

    res.status(200).json({ expenses, transactions });
  } catch (error) {
    logger.e(error, 'Failed to update expense', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

const deleteExpense = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const { id } = req.params;

  try {
    await expenseService.deleteExpense(id, tenant, user);

    const expenses = await expenseService.getTenantExpenses(tenant);
    const transactions = await transactionService.getTenantTransactions(tenant);

    res.status(200).json({ expenses, transactions });
  } catch (error) {
    logger.e(error, 'Failed to delete expense', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      expenseId: id,
    });
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

export default {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
