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
      subscription: true,
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
          address: true,
          _count: {
            select: { vehicles: true },
          },
        },
      },
      vehicleGroups: {
        include: {
          discounts: true,
        },
      },
      weeklyStats: {
        where: {
          OR: getWeekFilters(),
        },
      },
      monthlyStats: true,
      monthlyRentalStats: true,
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
    };
  }
}

export const tenantService = new TenantRepository();

const getWeekFilters = () => {
  const now = new Date();
  const currentWeek = getISOWeek(now);
  const currentYear = getYear(now);

  const lastWeekDate = subWeeks(now, 1);
  const previousWeek = getISOWeek(lastWeekDate);
  const previousYear = getYear(lastWeekDate);

  return [
    { week: currentWeek, year: currentYear },
    { week: previousWeek, year: previousYear },
  ];
};
