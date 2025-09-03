import { Tenant, TransactionType } from "@prisma/client";
import { logger } from "../../config/logger";
import { TxClient } from "../../config/prisma.config";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { transactionRepo } from "./transaction.repository";

const createPayment = async (
  data: CreatePaymentDto,
  tenant: Tenant,
  tx: TxClient,
  userId: string
) => {
  try {
    const booking = await tx.rental.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
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
        createdBy: userId,
        paymentId: data.id,
        tenantId: tenant.id,
        rentalId: data.bookingId,
      },
    });
  } catch (error) {
    logger.e(error, "Failed to create booking payment", {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      bookingId: data.bookingId,
      amount: data.amount,
    });
    throw error;
  }
};

const deleteBookingTransaction = async (bookingId: string, tx: TxClient) => {
  try {
    const booking = await tx.rental.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      logger.e("Booking not found", "Failed to delete booking");
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
    logger.e(error, "Failed to delete booking", {
      bookingId,
    });
    throw error;
  }
};

export default {
  createPayment,
  deleteBookingTransaction,
};
