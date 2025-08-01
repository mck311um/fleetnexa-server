import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import prisma from "../config/prisma.config";

const markBookingAsExpired = async () => {
  const tenants = await prisma.tenant.findMany();
  const now = new Date();

  for (const tenant of tenants) {
    const expiredBookings = await prisma.rental.findMany({
      where: {
        tenantId: tenant.id,
        status: "PENDING",
        endDate: {
          lt: now,
        },
      },
    });

    if (expiredBookings.length > 0) {
      await prisma.rental.updateMany({
        where: {
          id: {
            in: expiredBookings.map((booking) => booking.id),
          },
        },
        data: {
          status: "EXPIRED",
        },
      });
    }
  }
};

cron.schedule("0 * * * *", async () => {
  try {
  } catch (error) {
  } finally {
  }
});
