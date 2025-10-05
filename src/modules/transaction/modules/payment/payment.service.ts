import { Tenant, TransactionType, User } from '@prisma/client';
import { logger } from '../../../../config/logger';
import { PaymentDto, PaymentSchema } from './payment.dto';
import prisma from '../../../../config/prisma.config';
import { TransactionDto } from '../../transaction.dto';
import { transactionService } from '../../transaction.service';
import { v4 } from 'uuid';

class PaymentService {
  async validatePaymentData(data: any) {
    const safeParse = PaymentSchema.safeParse(data);
    if (!safeParse.success) {
      logger.e('Invalid payment data', 'Payment validation failed', {
        errors: safeParse.error.issues,
        input: data,
      });
      throw new Error('Invalid payment data');
    }

    return safeParse.data;
  }

  async getTenantPayments(tenant: Tenant) {
    try {
      const payments = await prisma.payment.findMany({
        where: { tenantId: tenant.id },
        include: {
          rental: true,
          paymentMethod: true,
          paymentType: true,
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
      return payments;
    } catch (error) {
      logger.e(error, 'Error fetching tenant payments', {
        tenantId: tenant.id,
      });
      throw new Error('Could not fetch tenant payments');
    }
  }

  async createPayment(data: PaymentDto, tenant: Tenant, user: User) {
    try {
      const payment = await prisma.$transaction(async (tx) => {
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

        const exitingBooking = await tx.rental.findUnique({
          where: { id: data.bookingId },
        });

        if (!exitingBooking) {
          throw new Error('Booking not found');
        }

        const newPayment = await tx.payment.create({
          data: {
            id: data.id,
            amount: data.amount,
            tenantId: tenant.id,
            rentalId: data.bookingId,
            paymentDate: data.paymentDate,
            notes: data.notes,
            paymentTypeId: data.paymentTypeId,
            paymentMethodId: data.paymentMethodId,
            createdAt: new Date(),
            updatedAt: new Date(),
            customerId: data.customerId,
            payer: `${existingCustomer.firstName} ${existingCustomer.lastName}`,
            payment: `Payment for booking #${exitingBooking.rentalNumber}`,
            updatedBy: user.username,
          },
        });

        return newPayment;
      });

      const transaction: TransactionDto = {
        id: v4(),
        amount: data.amount,
        type: TransactionType.PAYMENT,
        transactionDate: new Date().toISOString(),
        paymentId: payment.id,
        createdBy: user.username,
      };

      await transactionService.createTransaction(transaction, tenant, user);

      return payment;
    } catch (error) {
      logger.e(error, 'Error creating payment', {
        user: user.username,
        tenant: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }

  async updatePayment(data: PaymentDto, tenant: Tenant, user: User) {
    try {
      const payment = await prisma.$transaction(async (tx) => {
        const existingPayment = await tx.payment.findUnique({
          where: { id: data.id },
        });

        if (!existingPayment) {
          throw new Error('Payment not found');
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

        const updatedPayment = await tx.payment.update({
          where: { id: data.id },
          data: {
            amount: data.amount,
            rentalId: data.bookingId,
            paymentDate: data.paymentDate,
            notes: data.notes,
            paymentTypeId: data.paymentTypeId,
            paymentMethodId: data.paymentMethodId,
            updatedAt: new Date(),
            customerId: data.customerId,
            payer: `${existingCustomer.firstName} ${existingCustomer.lastName}`,
            payment: `Payment for booking #${exitingBooking.rentalNumber}`,
            updatedBy: user.username,
          },
        });

        return updatedPayment;
      });

      const existingTransaction = await prisma.transactions.findFirst({
        where: { paymentId: data.id },
      });

      if (!existingTransaction) {
        throw new Error('Associated transaction not found');
      }

      const transaction: TransactionDto = {
        id: existingTransaction.id,
        amount: data.amount,
        type: TransactionType.PAYMENT,
        transactionDate: new Date().toISOString(),
        createdBy: user.username,
      };

      await transactionService.updateTransaction(transaction, tenant, user);
    } catch (error) {
      logger.e(error, 'Error updating payment', {
        user: user.username,
        tenant: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }

  async deletePayment(paymentId: string, tenant: Tenant, user: User) {
    try {
      const existingPayment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!existingPayment) {
        throw new Error('Payment not found');
      }

      const existingTransaction = await prisma.transactions.findFirst({
        where: { paymentId: paymentId },
      });

      if (!existingTransaction) {
        throw new Error('Associated transaction not found');
      }

      await prisma.payment.update({
        where: { id: paymentId },
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
    } catch (error) {
      logger.e(error, 'Error deleting payment', {
        user: user.username,
        tenant: tenant.id,
        tenantCode: tenant.tenantCode,
        paymentId: paymentId,
      });
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
