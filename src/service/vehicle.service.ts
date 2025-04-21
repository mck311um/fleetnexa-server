import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class VehicleService {
  async getVehicles(
    tenantId: string,
    additionalWhere?: Prisma.VehicleWhereInput
  ) {
    return prisma.vehicle.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...additionalWhere,
      },
      include: this.getVehicleIncludeOptions(),
    });
  }

  async getVehicleById(id: string, tenantId: string) {
    return prisma.vehicle.findUnique({
      where: { id, tenantId, isDeleted: false },
      include: this.getVehicleIncludeOptions(),
    });
  }

  private getVehicleIncludeOptions(): Prisma.VehicleInclude {
    return {
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
      bookings: {
        include: {
          pickup: true,
          return: true,
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
      fuelType: true,
      features: true,
      damages: {
        where: { isDeleted: false },
        include: {
          customer: true,
        },
      },
      location: {
        include: {
          address: true,
        },
      },
    };
  }
}

export const vehicleService = new VehicleService();
