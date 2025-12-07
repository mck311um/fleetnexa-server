import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class TenantCustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomers(
    tenantId: string,
    additionalWhere?: Prisma.CustomerWhereInput,
  ) {
    return this.prisma.customer.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...additionalWhere,
      },
      include: this.getCustomerIncludeOptions(),
    });
  }

  async getCustomerById(id: string, tenantId: string) {
    return this.prisma.customer.findUnique({
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
      drivers: {
        include: {
          rental: {
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
      violations: {
        include: {
          violation: true,
        },
      },
    };
  }
}
