import { Agent, Prisma, PrismaClient, RentalStatus } from "@prisma/client";
import generator from "../../services/generator.service";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { logger } from "../../config/logger";
import { UpdateBookingDto } from "./dto/update-booking.dto";

const createBooking = async (
  tenant: any,
  data: CreateBookingDto,
  tx: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
  userId?: string
) => {
  try {
    const bookingNumber = await generator.generateRentalNumber(tenant.id);

    if (!bookingNumber) {
      throw new Error("Failed to generate booking number");
    }

    const bookingCode = generator.generateBookingCode(
      tenant.tenantCode,
      bookingNumber
    );

    if (!bookingCode) {
      throw new Error("Failed to generate booking code");
    }

    const newBooking = await tx.rental.create({
      data: {
        id: data.id,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        pickupLocationId: data.pickupLocationId,
        returnLocationId: data.returnLocationId,
        vehicleId: data.vehicleId,
        chargeTypeId: data.chargeTypeId,
        bookingCode,
        createdAt: new Date(),
        createdBy: userId ?? "SYSTEM",
        rentalNumber: bookingNumber,
        tenantId: tenant.id,
        status: RentalStatus.PENDING,
        agent: data.agent ?? Agent.SYSTEM,
      },
    });

    await Promise.all(
      data.drivers.map((driver) =>
        tx.rentalDriver.create({
          data: {
            ...driver,
            rentalId: newBooking.id,
          },
        })
      )
    );

    await tx.values.create({
      data: {
        id: data.values.id,
        numberOfDays: data.values.numberOfDays,
        basePrice: data.values.basePrice,
        customBasePrice: data.values.customBasePrice,
        totalCost: data.values.totalCost,
        customTotalCost: data.values.customTotalCost,
        discount: data.values.discount,
        customDiscount: data.values.customDiscount,
        deliveryFee: data.values.deliveryFee,
        customDeliveryFee: data.values.customDeliveryFee,
        collectionFee: data.values.collectionFee,
        customCollectionFee: data.values.customCollectionFee,
        deposit: data.values.deposit,
        customDeposit: data.values.customDeposit,
        totalExtras: data.values.totalExtras,
        subTotal: data.values.subTotal,
        netTotal: data.values.netTotal,
        discountMin: data.values.discountMin,
        discountMax: data.values.discountMax,
        discountAmount: data.values.discountAmount,
        discountPolicy: data.values.discountPolicy || "",
        rentalId: newBooking.id,
      },
    });

    await Promise.all(
      data.values.extras.map((extra) =>
        tx.rentalExtra.create({
          data: {
            id: extra.id,
            extraId: extra.extraId,
            amount: extra.amount,
            customAmount: extra.customAmount,
            valuesId: extra.valuesId,
          },
        })
      )
    );

    return newBooking;
  } catch (error) {
    logger.e(error, "Failed to create booking", {
      tenantId: tenant.id,
      tenantCode: tenant.code,
    });
    throw new Error("Failed to create booking");
  }
};

const updateBooking = async (
  data: UpdateBookingDto,
  tenant: any,
  tx: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
  userId: string
) => {
  try {
    const booking = await tx.rental.findUnique({ where: { id: data.id } });

    if (!booking) {
      throw new Error("Booking not found");
    }

    const updatedBooking = await tx.rental.update({
      where: { id: data.id },
      data: {
        id: data.id,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        pickupLocationId: data.pickupLocationId,
        returnLocationId: data.returnLocationId,
        vehicleId: data.vehicleId,
        chargeTypeId: data.chargeTypeId,
        status: data.status ?? RentalStatus.PENDING,
        agent: data.agent ?? Agent.SYSTEM,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    tx.rentalDriver.deleteMany({ where: { rentalId: booking.id } });

    await Promise.all(
      data.drivers.map((driver) =>
        tx.rentalDriver.create({
          data: {
            ...driver,
            rentalId: booking.id,
          },
        })
      )
    );

    await tx.values.update({
      where: { rentalId: booking.id },
      data: {
        numberOfDays: data.values.numberOfDays,
        basePrice: data.values.basePrice,
        customBasePrice: data.values.customBasePrice,
        totalCost: data.values.totalCost,
        customTotalCost: data.values.customTotalCost,
        discount: data.values.discount,
        customDiscount: data.values.customDiscount,
        deliveryFee: data.values.deliveryFee,
        customDeliveryFee: data.values.customDeliveryFee,
        collectionFee: data.values.collectionFee,
        customCollectionFee: data.values.customCollectionFee,
        deposit: data.values.deposit,
        customDeposit: data.values.customDeposit,
        totalExtras: data.values.totalExtras,
        subTotal: data.values.subTotal,
        netTotal: data.values.netTotal,
        discountMin: data.values.discountMin,
        discountMax: data.values.discountMax,
        discountAmount: data.values.discountAmount,
        discountPolicy: data.values.discountPolicy || "",
      },
    });

    await Promise.all(
      data.values.extras.map((extra) =>
        tx.rentalExtra.create({
          data: {
            id: extra.id,
            extraId: extra.extraId,
            amount: extra.amount,
            customAmount: extra.customAmount,
            valuesId: extra.valuesId,
          },
        })
      )
    );

    return updatedBooking;
  } catch (error) {
    logger.e(error, "Failed to update booking", {
      tenantId: tenant.id,
      tenantCode: tenant.code,
    });
    throw new Error("Failed to update booking");
  }
};

export default {
  createBooking,
  updateBooking,
};
