import { Prisma } from '@prisma/client';
import prisma from '../config/prisma.config';

class VehicleRepository {
  async getVehicles(
    tenantId: string,
    additionalWhere?: Prisma.VehicleWhereInput,
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

  async getAllVehicles() {
    return prisma.vehicle.findMany({
      where: {
        isDeleted: false,
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

  async getVehicleByLicensePlate(licensePlate: string, tenantId: string) {
    return prisma.vehicle.findUnique({
      where: { licensePlate, tenantId, isDeleted: false },
      include: this.getVehicleIncludeOptions(),
    });
  }

  async getVehicleByGroupId(
    groupId: string,
    tenantId: string,
    additionalWhere?: Prisma.VehicleWhereInput,
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

  private getVehicleIncludeOptions(): Prisma.VehicleInclude {
    return {
      brand: true,
      model: {
        include: {
          bodyType: true,
        },
      },
      vehicleStatus: true,
      transmission: true,
      wheelDrive: true,
      location: true,
      discounts: true,
      rentals: {
        where: { isDeleted: false },
        include: {
          pickup: true,
          return: true,
          values: true,
          drivers: {
            include: {
              customer: {
                include: {
                  license: true,
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
      serviceLogs: {
        include: {
          maintenanceService: true,
          contact: true,
          scheduledService: true,
          damage: true,
        },
      },
      scheduledServices: {
        include: {
          maintenanceService: true,
        },
      },
    };
  }
}

export const vehicleRepo = new VehicleRepository();
