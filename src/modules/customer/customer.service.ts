import { logger } from "../../config/logger";
import { TxClient } from "../../config/prisma.config";

const getPrimaryDriver = async (bookingId: string, tx: TxClient) => {
  try {
    const driver = await tx.rentalDriver.findFirst({
      where: {
        rentalId: bookingId,
        isPrimary: true,
      },
      include: {
        customer: {
          include: {
            address: {
              include: {
                country: true,
                state: true,
                village: true,
              },
            },
          },
        },
      },
    });

    if (!driver) {
      throw new Error("Primary driver not found");
    }

    return driver;
  } catch (error) {
    logger.e(error, "Error fetching primary driver", { bookingId });
    throw error;
  }
};

export default {
  getPrimaryDriver,
};
