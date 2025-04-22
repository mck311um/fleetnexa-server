import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class BookingService {
  async getBookings(
    tenantId: string,
    additionalWhere?: Prisma.BookingWhereInput
  ) {
    return prisma.booking.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...additionalWhere,
      },
      include: this.getBookingIncludeOptions(),
    });
  }

  async getBookingById(id: string, tenantId: string) {
    return prisma.booking.findUnique({
      where: { id, tenantId, isDeleted: false },
      include: this.getBookingIncludeOptions(),
    });
  }

  private getBookingIncludeOptions(): Prisma.BookingInclude {
    return {
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
          brand: true,
          model: {
            include: {
              bodyType: true,
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
    };
  }
}

export const bookingService = new BookingService();
