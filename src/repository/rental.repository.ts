import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.config";

class RentalRepository {
  async getRentals(
    tenantId: string,
    additionalWhere?: Prisma.RentalWhereInput
  ) {
    return prisma.rental.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...additionalWhere,
      },
      include: this.getRentalIncludeOptions(),
    });
  }

  async getRentalById(id: string, tenantId: string) {
    return prisma.rental.findUnique({
      where: { id, tenantId, isDeleted: false },
      include: this.getRentalIncludeOptions(),
    });
  }

  private getRentalIncludeOptions(): Prisma.RentalInclude {
    return {
      pickup: true,
      return: true,
      invoice: true,
      agreement: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      vehicle: {
        include: {
          brand: true,
          model: {
            include: {
              bodyType: true,
            },
          },
          vehicleStatus: true,
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
      payments: {
        include: {
          paymentMethod: true,
          paymentType: true,
        },
      },
      values: {
        include: {
          extras: true,
        },
      },
    };
  }
}

export const rentalRepo = new RentalRepository();
