import { Tenant, TransactionType, User } from '@prisma/client';
import { logger } from '../../../../config/logger';
import prisma from '../../../../config/prisma.config';
import { ExpenseDto, ExpenseSchema } from './expense.dto';
import { TransactionDto } from '../../transaction.dto';
import { transactionService } from '../../transaction.service';
import { v4 as uuidv4 } from 'uuid';

class ExpenseService {
  async validateExpenseData(data: any) {
    const safeParse = ExpenseSchema.safeParse(data);
    if (!safeParse.success) {
      logger.e(safeParse.error, 'Invalid expense data', data);
      throw new Error('Invalid expense data');
    }

    return safeParse.data;
  }

  async getTenantExpenses(tenant: Tenant) {
    try {
      const expenses = await prisma.expense.findMany({
        where: { tenantId: tenant.id },
        include: {
          vendor: true,
          vehicle: true,
        },
      });
      return expenses;
    } catch (error) {
      logger.e(error, 'Error fetching tenant expenses', {
        tenantId: tenant.id,
      });
      throw new Error('Could not fetch tenant expenses');
    }
  }

  async createExpense(data: ExpenseDto, tenant: Tenant, user: User) {
    try {
      await prisma.expense.create({
        data: {
          id: data.id,
          amount: -data.amount,
          expenseDate: data.expenseDate,
          notes: data.notes,
          vendorId: data.vendorId,
          vehicleId: data.vehicleId,
          tenantId: tenant.id,
          maintenanceId: data.maintenanceId,
          createdBy: user.username,
          expense: data.expense,
          payee: data.payee,
        },
      });

      const transaction: TransactionDto = {
        id: uuidv4(),
        amount: data.amount,
        type: TransactionType.EXPENSE,
        transactionDate: data.expenseDate,
        expenseId: data.id,
      };

      await transactionService.createTransaction(transaction, tenant, user);
    } catch (error) {
      logger.e(error, 'Failed to create expense', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        amount: data.amount,
      });
      throw error;
    }
  }

  async updateExpense(data: ExpenseDto, tenant: Tenant, user: User) {
    try {
      await prisma.$transaction(async (tx) => {
        const existingExpense = await tx.expense.findUnique({
          where: { id: data.id },
        });

        if (!existingExpense) {
          throw new Error('Expense not found');
        }

        await tx.expense.update({
          where: { id: data.id },
          data: {
            amount: -data.amount,
            expenseDate: data.expenseDate,
            notes: data.notes,
            vendorId: data.vendorId,
            vehicleId: data.vehicleId,
            updatedAt: new Date(),
          },
        });

        const existingTransaction = await tx.transactions.findFirst({
          where: { expenseId: data.id },
        });

        if (!existingTransaction) {
          throw new Error('Associated transaction not found');
        }

        const transaction: TransactionDto = {
          id: existingTransaction.id,
          amount: data.amount,
          transactionDate: data.expenseDate,
          type: TransactionType.EXPENSE,
        };

        await transactionService.updateTransaction(transaction, tenant, user);

        await tx.transactions.update({
          where: { id: existingTransaction.id },
          data: {
            amount: data.amount,
            transactionDate: data.expenseDate,
            updatedAt: new Date(),
            updatedBy: user.username,
          },
        });
      });
    } catch (error) {
      logger.e(error, 'Failed to update expense', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        amount: data.amount,
      });
      throw error;
    }
  }

  async deleteExpense(expenseId: string, tenant: Tenant, user: User) {
    try {
      const existingExpense = await prisma.expense.findUnique({
        where: { id: expenseId },
      });

      if (!existingExpense) {
        throw new Error('Expense not found');
      }

      const existingTransaction = await prisma.transactions.findFirst({
        where: { expenseId: expenseId },
      });

      if (!existingTransaction) {
        throw new Error('Associated transaction not found');
      }

      await prisma.expense.update({
        where: { id: expenseId },
        data: {
          isDeleted: true,
          updatedAt: new Date(),
        },
      });

      await transactionService.deleteTransaction(
        existingTransaction.id,
        tenant,
        user,
      );
    } catch (error) {
      logger.e(error, 'Error deleting expense', {
        user: user.username,
        tenant: tenant.id,
        tenantCode: tenant.tenantCode,
        expenseId: expenseId,
      });
      throw error;
    }
  }
}

export const expenseService = new ExpenseService();
