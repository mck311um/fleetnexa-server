import { Tenant, TransactionType, User } from '@prisma/client';
import { logger } from '../../config/logger';
import prisma, { TxClient } from '../../config/prisma.config';
import { PaymentDto } from './dto/create-payment.dto';

class TransactionService {
  async createPayment(data: PaymentDto, tenant: Tenant, user: User) {
    try {
      await prisma.$transaction(async (tx) => {
        const existingBooking = await tx.rental.findUnique({
          where: { id: data.bookingId },
        });

        if (!existingBooking) {
          throw new Error('Booking not found');
        }

        await tx.payment.create({
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
          },
        });

        await tx.transactions.create({
          data: {
            amount: data.amount,
            type: TransactionType.PAYMENT,
            transactionDate: data.paymentDate,
            customerId: data.customerId,
            createdBy: user.username,
            paymentId: data.id,
            tenantId: tenant.id,
            rentalId: data.bookingId,
          },
        });
      });
    } catch (error) {
      logger.e(error, 'Failed to create payment transaction', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        bookingId: data.bookingId,
        amount: data.amount,
      });
      throw error;
    }
  }

  async updatePayment(data: PaymentDto, tenant: Tenant, user: User) {
    try {
      await prisma.$transaction(async (tx) => {
        const existingPayment = await tx.payment.findUnique({
          where: { id: data.id },
        });

        if (!existingPayment) {
          throw new Error('Payment not found');
        }

        await tx.payment.update({
          where: { id: data.id },
          data: {
            amount: data.amount,
            paymentDate: data.paymentDate,
            notes: data.notes,
            paymentTypeId: data.paymentTypeId,
            paymentMethodId: data.paymentMethodId,
            updatedAt: new Date(),
          },
        });

        await tx.transactions.updateMany({
          where: { paymentId: data.id },
          data: { amount: data.amount },
        });
      });
    } catch (error) {
      logger.e(error, 'Failed to update payment transaction', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        bookingId: data.bookingId,
        amount: data.amount,
      });
      throw error;
    }
  }

  async deletePayment(paymentId: string, tenant: Tenant, user: User) {
    try {
      await prisma.$transaction(async (tx) => {
        const existingPayment = await tx.payment.findUnique({
          where: { id: paymentId },
        });

        if (!existingPayment) {
          throw new Error('Payment not found');
        }

        await tx.payment.update({
          where: { id: paymentId },
          data: { isDeleted: true, deletedAt: new Date() },
        });

        await tx.transactions.updateMany({
          where: { paymentId },
          data: { isDeleted: true, deletedAt: new Date() },
        });
      });
    } catch (error) {
      logger.e(error, 'Failed to delete payment transaction', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        paymentId,
      });
      throw error;
    }
  }
}

export const transactionService = new TransactionService();

const deleteBookingTransaction = async (bookingId: string, tx: TxClient) => {
  try {
    const booking = await tx.rental.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      logger.e('Booking not found', 'Failed to delete booking');
      return;
    }

    await tx.transactions.updateMany({
      where: { rentalId: bookingId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await tx.payment.updateMany({
      where: { rentalId: bookingId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await tx.refund.updateMany({
      where: { rentalId: bookingId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  } catch (error) {
    logger.e(error, 'Failed to delete booking', {
      bookingId,
    });
    throw error;
  }
};

export default {
  deleteBookingTransaction,
};
