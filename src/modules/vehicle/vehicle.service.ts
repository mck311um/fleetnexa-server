import { Tenant, User } from '@prisma/client';
import { logger } from '../../config/logger';
import prisma, { TxClient } from '../../config/prisma.config';
import { vehicleRepo } from './vehicle.repository';
import { UpdateVehicleStatusDto } from './vehicle.dto';

class VehicleService {
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
