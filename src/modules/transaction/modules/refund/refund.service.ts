import { Tenant, TransactionType, User } from '@prisma/client';
import { logger } from '../../../../config/logger';
import { RefundDto, RefundSchema } from './refund.dto';
import prisma from '../../../../config/prisma.config';
import { TransactionDto } from '../../transaction.dto';
import { v4 as uuidv4 } from 'uuid';
import { transactionService } from '../../transaction.service';

class RefundService {
  async validateRefundData(data: any) {
    const safeParse = RefundSchema.safeParse(data);
    if (!safeParse.success) {
      logger.e('Invalid refund data', 'Refund validation failed', {
        errors: safeParse.error.issues,
        input: data,
      });
      throw new Error('Invalid refund data');
    }

    return safeParse.data;
  }

  async getTenantRefunds(tenant: Tenant) {
    try {
      const refunds = await prisma.refund.findMany({
        where: { tenantId: tenant.id },
        include: {
          rental: true,
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });
      return refunds;
    } catch (error) {
      logger.e(error, 'Error fetching tenant refunds', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }

  async createRefund(data: RefundDto, tenant: Tenant, user: any) {
    try {
      const refund = await prisma.$transaction(async (tx) => {
        const existingBooking = await tx.rental.findUnique({
          where: { id: data.bookingId },
        });

        if (!existingBooking) {
          throw new Error('Booking not found');
        }

        const existingCustomer = await tx.customer.findUnique({
          where: { id: data.customerId },
        });

        if (!existingCustomer) {
          throw new Error('Customer not found');
        }

        const newRefund = await tx.refund.create({
          data: {
            id: data.id,
            amount: data.amount,
            refundDate: new Date(data.refundDate),
            reason: data.reason,
            rentalId: data.bookingId,
            tenantId: tenant.id,
            customerId: data.customerId,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: user.username,
            payee: `${existingCustomer.firstName} ${existingCustomer.lastName}`,
            payment: `Refund for booking #${existingBooking.rentalNumber}`,
            updatedBy: user.username,
          },
        });

        return newRefund;
      });

      const transaction: TransactionDto = {
        id: uuidv4(),
        amount: data.amount,
        type: TransactionType.REFUND,
        rentalId: data.bookingId,
        transactionDate: refund.refundDate.toISOString(),
        refundId: refund.id,
        createdBy: user.username,
      };

      await transactionService.createTransaction(transaction, tenant, user);
    } catch (error) {
      logger.e(error, 'Error creating refund', {
        user: user.username,
        tenant: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }

  async updateRefund(data: RefundDto, tenant: Tenant, user: any) {
    try {
      await prisma.$transaction(async (tx) => {
        const existingRefund = await tx.refund.findUnique({
          where: { id: data.id },
        });

        if (!existingRefund) {
          throw new Error('Refund not found');
        }

        const existingCustomer = await tx.customer.findUnique({
          where: { id: data.customerId },
        });

        if (!existingCustomer) {
          throw new Error('Customer not found');
        }

        const exitingBooking = await tx.rental.findUnique({
          where: { id: data.bookingId },
        });

        if (!exitingBooking) {
          throw new Error('Booking not found');
        }

        const updatedRefund = await tx.refund.update({
          where: { id: data.id },
          data: {
            amount: data.amount,
            refundDate: new Date(data.refundDate),
            reason: data.reason,
            rentalId: data.bookingId,
            customerId: data.customerId,
            updatedAt: new Date(),
            payee: `${existingCustomer.firstName} ${existingCustomer.lastName}`,
            payment: `Refund for booking #${exitingBooking.rentalNumber}`,
            updatedBy: user.username,
          },
        });

        return updatedRefund;
      });

      const existingTransaction = await prisma.transactions.findFirst({
        where: { refundId: data.id },
      });

      if (!existingTransaction) {
        throw new Error('Associated transaction not found');
      }

      const transaction: TransactionDto = {
        id: existingTransaction.id,
        amount: data.amount,
        transactionDate: data.refundDate,
        type: TransactionType.RENTAL,
        rentalId: data.bookingId,
        createdBy: user.username,
      };

      await transactionService.updateTransaction(transaction, tenant, user);
    } catch (error) {
      logger.e(error, 'Error updating refund', {
        user: user.username,
        tenant: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }

  async deleteRefund(refundId: string, tenant: Tenant, user: User) {
    try {
      const refund = await prisma.$transaction(async (tx) => {
        const existingRefund = await tx.refund.findUnique({
          where: { id: refundId },
        });

        if (!existingRefund) {
          throw new Error('Refund not found');
        }

        const existingTransaction = await tx.transactions.findFirst({
          where: { refundId: refundId },
        });

        if (!existingTransaction) {
          throw new Error('Associated transaction not found');
        }

        await tx.refund.update({
          where: { id: refundId },
          data: {
            isDeleted: true,
            updatedAt: new Date(),
            updatedBy: user.username,
          },
        });

        await transactionService.deleteTransaction(
          existingTransaction.id,
          tenant,
          user,
        );

        return existingRefund;
      });

      return refund;
    } catch (error) {
      logger.e(error, 'Error deleting refund', {
        refundId: refundId,
        tenant: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }
}

export const refundService = new RefundService();
