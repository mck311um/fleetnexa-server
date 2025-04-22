import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type TenantWithRelations = Prisma.TenantGetPayload<{
  include: ReturnType<TenantService["getTenantIncludeOptions"]>;
}>;

type AddressWithRelations = NonNullable<TenantWithRelations["address"]>;

class TenantService {
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
          maintenanceServices: true,
        },
      },
    };
  }
}

export const tenantService = new TenantService();
