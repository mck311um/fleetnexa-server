import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma.config';

class BookingRepository {
  async getRentals(
    tenantId: string,
    additionalWhere?: Prisma.RentalWhereInput,
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

  async getRentalsByCustomerId(
    customerId: string,
    tenantId: string,
    additionalWhere?: Prisma.RentalWhereInput,
  ) {
    return prisma.rental.findMany({
      where: {
        tenantId,
        isDeleted: false,
        drivers: {
          some: {
            driverId: customerId,
          },
        },
        ...additionalWhere,
      },
      include: this.getRentalIncludeOptions(),
    });
  }

  private getRentalIncludeOptions(): Prisma.RentalInclude {
    return {
      pickup: true,
      return: true,
      invoice: true,
      agreement: true,
      chargeType: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
      charges: true,
      refunds: {
        include: {
          customer: true,
        },
      },
      transactions: {
        include: {
          customer: true,
          payment: {
            include: {
              paymentMethod: true,
              paymentType: true,
            },
          },
          refund: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
        orderBy: {
          transactionDate: 'desc',
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
      drivers: {
        include: {
          customer: {
            include: {
              license: true,
              address: {
                include: {
                  village: true,
                  country: true,
                  state: true,
                },
              },
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

export const repo = new BookingRepository();
