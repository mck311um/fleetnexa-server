import app from "../app";
import prisma from "../config/prisma.config";
import cron from "node-cron";

const runUnconfirmedRentalsCron = async () => {
  try {
    const now = new Date();
    now.setMinutes(0, 0, 0);

    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);

    const tenants = await prisma.tenant.findMany();

    for (const tenant of tenants) {
      const rentals = await prisma.rental.findMany({
        where: {
          tenantId: tenant.id,
          status: "PENDING",
          startDate: {
            gte: threeDaysFromNow,
            lt: new Date(threeDaysFromNow.getTime() + 60 * 60 * 1000),
          },
        },
      });

      for (const rental of rentals) {
        const primaryDriver = await prisma.rentalDriver.findFirst({
          where: {
            rentalId: rental.id,
            primaryDriver: true,
          },
          include: {
            driver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        const bookingNumber = rental.rentalNumber;
        const actionUrl = `/app/bookings/${bookingNumber}`;
        const driverName = primaryDriver
          ? `${primaryDriver.driver.firstName} ${primaryDriver.driver.lastName}`
          : "Unknown Driver";

        const message = `Booking #${rental.rentalNumber} by ${driverName} remains unconfirmed (2 days remaining)`;

        const notification = await prisma.tenantNotification.create({
          data: {
            tenantId: tenant.id,
            title: "Unconfirmed Rental Alert",
            type: "UNCONFIRMED",
            priority: "MEDIUM",
            message,
            actionUrl,
            read: false,
            createdAt: new Date(),
          },
        });

        const io = app.get("io");
        io.to(tenant.id).emit("tenant-notification", notification);
      }
    }
  } catch (error) {
    console.error("Error in unconfirmedRentals:", error);
    throw error;
  }
};

cron.schedule("0 * * * *", async () => {
  try {
    console.log("Running notifications cron job...");
    await runUnconfirmedRentalsCron();
  } catch (error) {
    console.error("Error running notifications cron job:", error);
  } finally {
    console.log("Notifications cron job completed.");
  }
});
