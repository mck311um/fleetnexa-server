import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.config";

class VehicleRepository {
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

  async getVehicleByGroupId(
    groupId: string,
    tenantId: string,
    additionalWhere?: Prisma.VehicleWhereInput
  ) {
    return prisma.vehicle.findMany({
      where: {
        tenantId,
        vehicleGroupId: groupId,
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
      vehicleGroup: {
        include: {
          discounts: true,

          chargeType: true,
          fuelPolicy: true,
        },
      },
      transmission: true,
      wheelDrive: true,
      rentals: {
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

class VehicleGroupRepository {
  async getVehicleGroups(
    tenantId: string,
    additionalWhere?: Prisma.VehicleGroupWhereInput
  ) {
    return prisma.vehicleGroup.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...additionalWhere,
      },
      include: this.getVehicleGroupIncludeOptions(),
    });
  }

  async getVehicleGroupById(id: string, tenantId: string) {
    return prisma.vehicleGroup.findUnique({
      where: { id, tenantId, isDeleted: false },
      include: this.getVehicleGroupIncludeOptions(),
    });
  }

  private getVehicleGroupIncludeOptions(): Prisma.VehicleGroupInclude {
    return {
      discounts: true,
      chargeType: true,
      fuelPolicy: true,
      rentals: true,
      vehicles: {
        where: { isDeleted: false },
        include: {
          rentals: true,
          brand: true,
          model: true,
        },
      },
      _count: {
        select: {
          vehicles: {
            where: { isDeleted: false },
          },
          rentals: true,
        },
      },
    };
  }
}

export const vehicleRepo = new VehicleRepository();
export const vehicleGroupRepo = new VehicleGroupRepository();
