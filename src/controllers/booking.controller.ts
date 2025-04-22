import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const getBookings = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  try {
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }

    const bookings = await prisma.booking.findMany({
      where: { tenantId },
      include: {
        pickup: true,
        return: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicle: {
          include: {
            make: true,
            model: {
              include: {
                type: true,
              },
            },
            vehicleStatus: true,
            vehicleGroup: true,
            transmission: true,
            wheelDrive: true,
            fuelType: true,
            features: true,
            damages: {
              where: { isDeleted: false },
              include: {
                customer: true,
              },
            },
          },
        },
        vehicleGroup: true,
        customer: true,
        values: {
          include: {
            extras: true,
          },
        },
      },
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : undefined,
    });
  }
};
const handleBooking = async (req: Request, res: Response) => {
  const { booking } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  if (!booking) {
    return res.status(400).json({ error: "Booking data is required" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const bookingData = {
        startDate: booking.startDate,
        endDate: booking.endDate,
        pickupLocationId: booking.pickupLocationId,
        returnLocationId: booking.returnLocationId,
        vehicleId: booking.vehicleId,
        customerId: booking.customerId,
        agent: booking.agent,
        signature: booking.signature,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
        vehicleGroupId: booking.vehicleGroupId,
        tenantId,
        status: booking.status,
        notes: booking.notes,
      };

      const upsertedBooking = await tx.booking.upsert({
        where: { id: booking.id },
        create: { id: booking.id, ...bookingData },
        update: bookingData,
      });

      let upsertedValues: any = null;
      if (booking.values) {
        const valuesData = {
          numberOfDays: parseFloat(booking.values.numberOfDays),
          basePrice: parseFloat(booking.values.basePrice),
          totalCost: parseFloat(booking.values.totalCost),
          discount: parseFloat(booking.values.discount),
          deliveryFee: parseFloat(booking.values.deliveryFee),
          collectionFee: parseFloat(booking.values.collectionFee),
          deposit: parseFloat(booking.values.deposit),
          totalExtras: parseFloat(booking.values.totalExtras),
          subTotal: parseFloat(booking.values.subTotal),
          netTotal: parseFloat(booking.values.netTotal),
          discountMin: parseFloat(booking.values.discountMin),
          discountMax: parseFloat(booking.values.discountMax),
          discountAmount: parseFloat(booking.values.discountAmount),
          discountPolicy: booking.values.discountPolicy,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        upsertedValues = await tx.values.upsert({
          where: { id: booking.values.id },
          create: {
            id: booking.values.id,
            bookingId: booking.id,
            ...valuesData,
          },
          update: valuesData,
        });

        if (booking.values.extras?.length) {
          await tx.bookingExtras.deleteMany({
            where: {
              valuesId: upsertedValues.id,
              id: {
                notIn: booking.values.extras
                  .map((e: any) => e.id)
                  .filter(Boolean),
              },
            },
          });

          const extrasPromises = booking.values.extras.map((extra: any) =>
            tx.bookingExtras.upsert({
              where: { id: extra.id },
              create: {
                id: extra.id,
                extraId: extra.extraId,
                amount: extra.amount,
                valuesId: upsertedValues.id,
              },
              update: {
                extraId: extra.extraId,
                amount: extra.amount,
                valuesId: upsertedValues.id,
              },
            })
          );

          await Promise.all(extrasPromises);
        }
      }
    });

    const bookings = await prisma.booking.findMany({
      where: { tenantId: tenantId! },
      include: {
        values: {
          include: {
            extras: true,
          },
        },
        vehicle: {
          include: {
            make: true,
            model: {
              include: {
                type: true,
              },
            },
            vehicleStatus: true,
            vehicleGroup: true,
            transmission: true,
            wheelDrive: true,
            fuelType: true,
            features: true,
            damages: {
              where: { isDeleted: false },
              include: {
                customer: true,
              },
            },
          },
        },
        customer: {
          include: {
            address: {
              include: {
                village: true,
                state: true,
                country: true,
              },
            },
          },
        },
        pickup: true,
        return: true,
      },
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error handling booking:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : undefined,
    });
  }
};
export default {
  handleBooking,
  getBookings,
};
