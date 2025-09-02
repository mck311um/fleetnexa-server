import { logger } from "../../config/logger";
import { TxClient } from "../../config/prisma.config";
import { transactionRepo } from "./transaction.repository";

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
  deleteBookingTransaction,
};
