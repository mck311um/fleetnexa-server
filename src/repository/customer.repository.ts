import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.config";

class CustomerRepository {
  async getCustomers(
    tenantId: string,
    additionalWhere?: Prisma.CustomerWhereInput
  ) {
    return prisma.customer.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...additionalWhere,
      },
      include: this.getCustomerIncludeOptions(),
    });
  }

  async getCustomerById(id: string, tenantId: string) {
    return prisma.customer.findUnique({
      where: { id, tenantId, isDeleted: false },
      include: this.getCustomerIncludeOptions(),
    });
  }

  private getCustomerIncludeOptions(): Prisma.CustomerInclude {
    return {
      address: {
        include: {
          country: true,
          state: true,
          village: true,
        },
      },
      documents: {
        include: {
          document: true,
        },
      },
      rentals: {
        include: {
          pickup: true,
          return: true,
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
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
      },
      invoices: true,
      damages: true,
      license: {
        include: {
          class: true,
          country: true,
        },
      },
      apps: true,
    };
  }
}

export const customerRepo = new CustomerRepository();
