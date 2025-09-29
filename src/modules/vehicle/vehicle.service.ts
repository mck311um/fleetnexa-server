import { Tenant, User } from '@prisma/client';
import { logger } from '../../config/logger';
import prisma, { TxClient } from '../../config/prisma.config';
import { vehicleRepo } from './vehicle.repository';
import {
  UpdateVehicleStatusDto,
  VehicleDto,
  VehicleSchema,
} from './vehicle.dto';

class VehicleService {
  validateVehicleData(data: any) {
    if (!data) {
      throw new Error('No data provided');
    }

    const safeParse = VehicleSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Invalid vehicle data', {
        errors: safeParse.error.issues,
        data,
      });
      throw new Error('Invalid vehicle data');
    }

    return safeParse.data;
  }

  async getTenantVehicles(tenant: Tenant) {
    try {
      const vehicles = await vehicleRepo.getVehicles(tenant.id);

      return vehicles;
    } catch (error) {
      logger.e(error, 'Failed to get vehicles', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to get vehicles');
    }
  }

  async getVehicleById(vehicleId: string, tenant: Tenant) {
    try {
      const vehicle = await vehicleRepo.getVehicleById(vehicleId, tenant.id);

      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      return vehicle;
    } catch (error) {
      logger.e(error, 'Failed to get vehicle by ID', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        vehicleId,
      });
      throw new Error('Failed to get vehicle by ID');
    }
  }

  async addVehicle(data: VehicleDto, tenant: Tenant, user: User) {
    try {
      await prisma.$transaction(async (tx) => {
        const existingPlate = await tx.vehicle.findFirst({
          where: {
            licensePlate: data.licensePlate,
          },
        });

        if (existingPlate) {
          throw new Error('A vehicle with this license plate already exists');
        }

        await tx.vehicle.create({
          data: {
            id: data.id,
            tenantId: tenant.id,
            color: data.color,
            engineVolume: data.engineVolume,
            featuredImage: data.featuredImage,
            features:
              data.features && data.features.length > 0
                ? {
                    connect: data.features.map((feature) => ({
                      id: feature.id,
                    })),
                  }
                : undefined,
            fuelLevel: data.fuelLevel,
            images: data.images || [],
            licensePlate: data.licensePlate,
            brandId: data.brandId,
            modelId: data.modelId,
            numberOfSeats: data.numberOfSeats,
            numberOfDoors: data.numberOfDoors,
            odometer: data.odometer || 0,
            steering: data.steering,
            vin: data.vin || '',
            year: data.year,
            transmissionId: data.transmissionId,
            vehicleStatusId: data.vehicleStatusId,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: user.username,
            wheelDriveId: data.wheelDriveId,
            fuelTypeId: data.fuelTypeId,
            isDeleted: false,
            dayPrice: data.dayPrice,
            weekPrice: data.weekPrice,
            monthPrice: data.monthPrice,
            timeBetweenRentals: data.timeBetweenRentals,
            minimumAge: data.minimumAge,
            minimumRental: data.minimumRental,
            fuelPolicyId: data.fuelPolicyId,
            locationId: data.locationId,
            drivingExperience: data.drivingExperience,
          },
        });

        if (data.discounts && data.discounts.length > 0) {
          await Promise.all(
            data.discounts.map((discount) =>
              tx.vehicleDiscount.upsert({
                where: { id: discount.id },
                create: {
                  id: discount.id,
                  vehicleId: data.id,
                  periodMin: discount.periodMin,
                  periodMax: discount.periodMax,
                  amount: discount.amount,
                  discountPolicy: discount.discountPolicy,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                update: {
                  periodMin: discount.periodMin,
                  periodMax: discount.periodMax,
                  amount: discount.amount,
                  discountPolicy: discount.discountPolicy,
                  updatedAt: new Date(),
                },
              }),
            ),
          );
        }
      });
    } catch (error) {}
  }

  async updateVehicle(data: VehicleDto, tenant: Tenant, user: User) {
    try {
      await prisma.$transaction(async (tx) => {
        const vehicle = await tx.vehicle.findUnique({
          where: { id: data.id },
        });

        if (!vehicle) {
          throw new Error('Vehicle not found');
        }

        await tx.vehicle.update({
          where: { id: data.id },
          data: {
            color: data.color,
            engineVolume: data.engineVolume,
            featuredImage: data.featuredImage,
            features:
              data.features && data.features.length > 0
                ? {
                    set: data.features.map((feature) => ({
                      id: feature.id,
                    })),
                  }
                : { set: [] },
            fuelLevel: data.fuelLevel,
            images: data.images || [],
            licensePlate: data.licensePlate,
            brandId: data.brandId,
            modelId: data.modelId,
            numberOfSeats: data.numberOfSeats,
            numberOfDoors: data.numberOfDoors,
            odometer: data.odometer || 0,
            steering: data.steering,
            vin: data.vin || '',
            year: data.year,
            transmissionId: data.transmissionId,
            vehicleStatusId: data.vehicleStatusId,
            updatedAt: new Date(),
            updatedBy: user.username,
            wheelDriveId: data.wheelDriveId,
            fuelTypeId: data.fuelTypeId,
            dayPrice: data.dayPrice,
            weekPrice: data.weekPrice,
            monthPrice: data.monthPrice,
            timeBetweenRentals: data.timeBetweenRentals,
            minimumAge: data.minimumAge,
            minimumRental: data.minimumRental,
            fuelPolicyId: data.fuelPolicyId,
            locationId: data.locationId,
            drivingExperience: data.drivingExperience,
          },
        });

        if (data.discounts && data.discounts.length > 0) {
          const newDiscountIds = data.discounts
            .map((discount: any) => discount.id)
            .filter(Boolean);

          await tx.vehicleDiscount.deleteMany({
            where: {
              vehicleId: vehicle.id,
              NOT: { id: { in: newDiscountIds } },
            },
          });

          await Promise.all(
            data.discounts.map((discount) =>
              tx.vehicleDiscount.upsert({
                where: { id: discount.id },
                create: {
                  id: discount.id,
                  vehicleId: data.id,
                  periodMin: discount.periodMin,
                  periodMax: discount.periodMax,
                  amount: discount.amount,
                  discountPolicy: discount.discountPolicy,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                update: {
                  periodMin: discount.periodMin,
                  periodMax: discount.periodMax,
                  amount: discount.amount,
                  discountPolicy: discount.discountPolicy,
                  updatedAt: new Date(),
                },
              }),
            ),
          );
        }
      });
    } catch (error) {
      logger.e(error, 'Failed to  update vehicle', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw new Error('Failed to update vehicle');
    }
  }

  async getVehicleByLicensePlate(licensePlate: string, tenant: Tenant) {
    try {
      const vehicle = await vehicleRepo.getVehicleByLicensePlate(
        licensePlate,
        tenant.id,
      );

      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      return vehicle;
    } catch (error) {
      logger.e(error, 'Failed to get vehicle by license plate', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        licensePlate,
      });
      throw new Error('Failed to get vehicle by license plate');
    }
  }

  async updateVehicleStatus(
    data: UpdateVehicleStatusDto,
    tenant: Tenant,
    user: User,
  ) {
    try {
      await prisma.$transaction(async (tx) => {
        const vehicle = await tx.vehicle.findUnique({
          where: { id: data.vehicleId },
        });

        if (!vehicle) {
          logger.w('Vehicle not found', {
            vehicleId: data.vehicleId,
            tenantId: tenant.id,
          });
          throw new Error('Vehicle not found');
        }

        const foundStatus = await tx.vehicleStatus.findUnique({
          where: { id: data.status },
        });

        if (!foundStatus) {
          logger.w('Vehicle status not found', {
            status: data.status,
            tenantId: tenant.id,
          });
          throw new Error('Vehicle status not found');
        }

        await tx.vehicle.update({
          where: { id: data.vehicleId },
          data: { vehicleStatusId: foundStatus.id, updatedBy: user.username },
        });
      });
    } catch (error) {
      logger.e(error, 'Failed to update vehicle status', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw new Error('Failed to update vehicle status');
    }
  }

  async deleteVehicle(vehicleId: string, tenant: Tenant, user: User) {
    try {
      await prisma.$transaction(async (tx) => {
        const vehicle = await tx.vehicle.findUnique({
          where: { id: vehicleId },
        });

        if (!vehicle) {
          logger.w('Vehicle not found', {
            vehicleId,
            tenantId: tenant.id,
          });
          throw new Error('Vehicle not found');
        }

        await tx.vehicle.update({
          where: { id: vehicleId },
          data: {
            isDeleted: true,
            updatedBy: user.username,
            updatedAt: new Date(),
          },
        });
      });
    } catch (error) {
      logger.e(error, 'Failed to delete vehicle', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        vehicleId,
      });
      throw new Error('Failed to delete vehicle');
    }
  }

  async updateVehicleStorefrontStatus(
    vehicleId: string,
    tenant: Tenant,
    user: User,
  ) {
    try {
      await prisma.$transaction(async (tx) => {
        if (!tenant.storefrontEnabled) {
          throw new Error('Storefront is not enabled for this tenant');
        }

        const vehicle = await tx.vehicle.findUnique({
          where: { id: vehicleId },
        });

        if (!vehicle) {
          logger.w('Vehicle not found', {
            vehicleId,
            tenantId: tenant.id,
          });
          throw new Error('Vehicle not found');
        }

        await tx.vehicle.update({
          where: { id: vehicleId },
          data: {
            storefrontEnabled: !vehicle.storefrontEnabled,
            updatedBy: user.username,
          },
        });
      });
    } catch (error) {
      logger.e(error, 'Failed to update vehicle storefront status', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        vehicleId,
      });
      throw new Error('Failed to update vehicle storefront status');
    }
  }
}

export const vehicleService = new VehicleService();

const updateVehicleStatus = async (
  vehicleId: string,
  status: string,
  tenant: Tenant,
  tx: TxClient,
  userId: string,
) => {
  try {
    const vehicle = await tx.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      logger.w('Vehicle not found', { vehicleId, userId });
      throw new Error('Vehicle not found');
    }

    const foundStatus = await tx.vehicleStatus.findUnique({
      where: { status: status },
    });

    if (!foundStatus) {
      logger.w('Vehicle status not found', { status, userId });
      throw new Error('Vehicle status not found');
    }

    await tx.vehicle.update({
      where: { id: vehicleId },
      data: { vehicleStatusId: foundStatus.id, updatedBy: userId },
    });
  } catch (error) {
    logger.e(error, 'Failed to update vehicle status', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      vehicleId,
      userId,
    });
    throw new Error('Failed to update vehicle status');
  }
};

export default {
  updateVehicleStatus,
};
