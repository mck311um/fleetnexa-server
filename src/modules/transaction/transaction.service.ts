import { Tenant, TransactionType, User } from '@prisma/client';
import { logger } from '../../config/logger';
import prisma, { TxClient } from '../../config/prisma.config';
import { PaymentDto } from './dto/create-payment.dto';
import { TransactionDto } from './transaction.dto';
import { transactionRepo } from './transaction.repository';

class TransactionService {
  async getTenantTransactions(tenant: Tenant) {
    try {
      const transactions = await transactionRepo.getTransactions(tenant.id);
      return transactions;
    } catch (error) {
      logger.e(error, 'Failed to fetch tenant transactions', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }

  async createTransaction(data: TransactionDto, tenant: Tenant, user: User) {
    try {
      await prisma.$transaction(async (tx: TxClient) => {
        await tx.transactions.create({
          data: {
            id: data.id,
            amount: data.amount,
            type: data.type,
            transactionDate: data.transactionDate,
            createdBy: user.id,
            paymentId: data.paymentId,
            refundId: data.refundId,
            expenseId: data.expenseId,
            tenantId: tenant.id,
          },
        });
      });
    } catch (error) {
      logger.e(error, 'Failed to create transaction', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        type: data.type,
        amount: data.amount,
      });
      throw error;
    }
  }

  async updateTransaction(data: TransactionDto, tenant: Tenant, user: User) {
    try {
      await prisma.$transaction(async (tx: TxClient) => {
        const existingTransaction = await tx.transactions.findUnique({
          where: { id: data.id },
        });
        if (!existingTransaction) {
          throw new Error('Transaction not found');
        }
        await tx.transactions.update({
          where: { id: data.id },
          data: {
            amount: data.amount,
            transactionDate: data.transactionDate,
            updatedAt: new Date(),
            updatedBy: user.username,
          },
        });
      });
    } catch (error) {
      logger.e(error, 'Failed to update transaction', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        transactionId: data.id,
        amount: data.amount,
      });
      throw error;
    }
  }

  async deleteTransaction(transactionId: string, tenant: Tenant, user: User) {
    try {
      await prisma.$transaction(async (tx: TxClient) => {
        const existingTransaction = await tx.transactions.findUnique({
          where: { id: transactionId },
        });
        if (!existingTransaction) {
          throw new Error('Transaction not found');
        }
        await tx.transactions.update({
          where: { id: transactionId },
          data: {
            isDeleted: true,
            updatedAt: new Date(),
            updatedBy: user.username,
          },
        });
      });
    } catch (error) {
      logger.e(error, 'Failed to delete transaction', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        transactionId,
      });
      throw error;
    }
  }
}

export const transactionService = new TransactionService();

const deleteBookingTransaction = async (bookingId: string, tx: TxClient) => {
  // try {
  //   const booking = await tx.rental.findUnique({
  //     where: { id: bookingId },
  //   });
  //   if (!booking) {
  //     logger.e('Booking not found', 'Failed to delete booking');
  //     return;
  //   }
  //   await tx.transactions.updateMany({
  //     where: { rentalId: bookingId },
  //     data: { isDeleted: true, deletedAt: new Date() },
  //   });
  //   await tx.payment.updateMany({
  //     where: { rentalId: bookingId },
  //     data: { isDeleted: true, deletedAt: new Date() },
  //   });
  //   await tx.refund.updateMany({
  //     where: { rentalId: bookingId },
  //     data: { isDeleted: true, deletedAt: new Date() },
  //   });
  // } catch (error) {
  //   logger.e(error, 'Failed to delete booking', {
  //     bookingId,
  //   });
  //   throw error;
  // }
};

export default {
  deleteBookingTransaction,
};
