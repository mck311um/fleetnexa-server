import { Prisma } from "@prisma/client";
import { getISOWeek, getYear, subWeeks } from "date-fns";
import prisma from "../config/prisma.config";

class TenantRepository {
  async getTenantById(tenantId: string) {
    return prisma.tenant.findUnique({
      where: { id: tenantId },
      include: this.getTenantIncludeOptions(),
    });
  }

  private getTenantIncludeOptions(): Prisma.TenantInclude {
    return {
      address: {
        include: {
          village: true,
          state: true,
          country: true,
        },
      },
      currency: true,
      invoiceSequence: true,
      paymentMethods: true,
      customers: true,
      subscription: {
        include: {
          payments: {
            include: {
              plan: true,
            },
          },
          plan: {
            include: {
              details: true,
              features: true,
            },
          },
        },
      },
      services: {
        where: { isDeleted: false },
        include: {
          service: true,
        },
      },
      insurance: {
        where: { isDeleted: false },
      },
      equipment: {
        where: { isDeleted: false },
        include: {
          equipment: true,
        },
      },
      tenantLocations: {
        where: { isDeleted: false },
        include: {
          vehicles: true,
          _count: {
            select: { vehicles: true },
          },
        },
      },
      weeklyStats: {
        where: {
          OR: getFilters(),
        },
      },
      monthlyStats: true,
      monthlyRentalStats: true,
      yearlyStats: true,
      cancellationPolicy: true,
      latePolicy: true,

      transactions: {
        where: { isDeleted: false },
        include: {
          customer: true,
          payment: {
            include: {
              paymentMethod: true,
              paymentType: true,
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
      },
      rentalActivity: {
        include: {
          vehicle: {
            select: {
              brand: true,
              model: true,
            },
          },
          customer: true,
        },
      },
      currencyRates: {
        include: {
          currency: true,
        },
      },
    };
  }
}

export const tenantRepo = new TenantRepository();

const getFilters = () => {
  const now = new Date();
  const currentWeek = getISOWeek(now);
  const currentYear = getYear(now);

  return [
    {
      year: currentYear,
      week: {
        lte: currentWeek,
      },
    },
  ];
};
