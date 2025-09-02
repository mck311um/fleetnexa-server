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
            isPrimary: true,
          },
          include: {
            customer: {
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
        const actionUrl = `/app/bookings`;
        const customerName = primaryDriver
          ? `${primaryDriver.customer.firstName} ${primaryDriver.customer.lastName}`
          : "Unknown Customer";

        const message = `Booking #${rental.rentalNumber} by ${customerName} remains unconfirmed (2 days remaining)`;

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

const runUpcomingRentalsCron = async () => {
  try {
    const now = new Date();
    now.setMinutes(0, 0, 0);

    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(now.getDate() + 1);

    const tenants = await prisma.tenant.findMany();

    for (const tenant of tenants) {
      const rentals = await prisma.rental.findMany({
        where: {
          tenantId: tenant.id,
          status: {
            in: ["CONFIRMED", "RESERVED"],
          },
          startDate: {
            gte: oneDayFromNow,
            lt: new Date(oneDayFromNow.getTime() + 60 * 60 * 1000),
          },
        },
        include: {
          vehicle: {
            include: {
              brand: true,
              model: true,
            },
          },
          pickup: true,
        },
      });

      for (const rental of rentals) {
        const primaryDriver = await prisma.rentalDriver.findFirst({
          where: {
            rentalId: rental.id,
            isPrimary: true,
          },
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        const actionUrl = `/app/bookings`;
        const formattedTime = rental.startDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        const customerName = primaryDriver
          ? `${primaryDriver.customer.firstName} ${primaryDriver.customer.lastName}`
          : "Unknown Customer";
        const vehicleName =
          (rental.vehicle.brand?.brand ?? "Unknown Brand") +
          " " +
          (rental.vehicle.model?.model ?? "Unknown Model");
        const pickupLocation = rental.pickup?.location ?? "Unknown Location";

        const message = `Reminder: ${customerName} pickup scheduled for tomorrow at ${formattedTime} - ${vehicleName} at ${pickupLocation}`;

        const notification = await prisma.tenantNotification.create({
          data: {
            tenantId: tenant.id,
            title: "Vehicle Pickup",
            type: "UPCOMING",
            priority: "HIGH",
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
    console.error("Error in upcomingRentals:", error);
    throw error;
  }
};

const runUpcomingReturnsCron = async () => {
  try {
    const now = new Date();
    now.setMinutes(0, 0, 0);

    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(now.getDate() + 1);

    const tenants = await prisma.tenant.findMany();

    for (const tenant of tenants) {
      const rentals = await prisma.rental.findMany({
        where: {
          tenantId: tenant.id,
          status: {
            in: ["ACTIVE"],
          },
          endDate: {
            gte: oneDayFromNow,
            lt: new Date(oneDayFromNow.getTime() + 60 * 60 * 1000),
          },
        },
        include: {
          vehicle: {
            include: {
              brand: true,
              model: true,
            },
          },
          return: true,
        },
      });

      for (const rental of rentals) {
        const primaryDriver = await prisma.rentalDriver.findFirst({
          where: {
            rentalId: rental.id,
            isPrimary: true,
          },
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        const actionUrl = `/app/bookings`;
        const formattedTime = rental.startDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        const customerName = primaryDriver
          ? `${primaryDriver.customer.firstName} ${primaryDriver.customer.lastName}`
          : "Unknown Customer";
        const vehicleName =
          (rental.vehicle.brand?.brand ?? "Unknown Brand") +
          " " +
          (rental.vehicle.model?.model ?? "Unknown Model");
        const returnLocation = rental.return?.location ?? "Unknown Location";

        const message = `Vehicle return  tomorrow: ${vehicleName} by ${customerName} to ${returnLocation} - ${formattedTime}`;

        const notification = await prisma.tenantNotification.create({
          data: {
            tenantId: tenant.id,
            title: "Vehicle Return",
            type: "RETURN",
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
    console.error("Error in upcomingRentals:", error);
    throw error;
  }
};

cron.schedule("0 * * * *", async () => {
  try {
    console.log("Running notifications cron job...");
    await runUpcomingRentalsCron();
    await runUnconfirmedRentalsCron();
    await runUpcomingReturnsCron();
  } catch (error) {
    console.error("Error running notifications cron job:", error);
  } finally {
    console.log("Notifications cron job completed.");
  }
});
