import { Tenant, User } from '@prisma/client';
import { logger } from '../../../../config/logger';
import {
  VehicleMaintenanceDto,
  VehicleMaintenanceSchema,
} from './vehicle-maintenance.dto';
import prisma from '../../../../config/prisma.config';

class VehicleMaintenanceService {
  async validateMaintenanceData(data: any) {
    const safeParse = VehicleMaintenanceSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Invalid vehicle maintenance data', {
        errors: safeParse.error.issues,
        data,
      });
      throw new Error('Invalid vehicle maintenance data');
    }

    return safeParse.data;
  }

  async getVehicleMaintenances(vehicleId: string) {
    try {
      const maintenances = await prisma.vehicleMaintenance.findMany({
        where: { vehicleId, isDeleted: false },
        include: {
          maintenance: true,
          vendor: true,
        },
        orderBy: { startDate: 'desc' },
      });
      return maintenances;
    } catch (error) {
      logger.e(error, 'Error fetching vehicle maintenances', { vehicleId });
      throw new Error('Could not fetch vehicle maintenances');
    }
  }

  async addVehicleMaintenance(
    data: VehicleMaintenanceDto,
    tenant: Tenant,
    user: User,
  ) {
    try {
      await prisma.vehicleMaintenance.create({
        data: {
          id: data.id,
          vehicleId: data.vehicleId,
          serviceId: data.serviceId,
          vendorId: data.vendorId || null,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          cost: data.cost,
        },
      });
    } catch (error) {
      logger.e(error, 'Error adding vehicle maintenance', {
        teatId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Could not add vehicle maintenance');
    }
  }

  async updateVehicleMaintenance(
    data: VehicleMaintenanceDto,
    tenant: Tenant,
    user: User,
  ) {
    try {
      const existingRecord = await prisma.vehicleMaintenance.findUnique({
        where: { id: data.id },
      });

      if (!existingRecord) {
        throw new Error('Vehicle maintenance record not found');
      }

      await prisma.vehicleMaintenance.update({
        where: { id: data.id },
        data: {
          vehicleId: data.vehicleId,
          serviceId: data.serviceId,
          vendorId: data.vendorId || null,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          cost: data.cost,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });
    } catch (error) {
      logger.e(error, 'Error updating vehicle maintenance', {
        teatId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Could not update vehicle maintenance');
    }
  }

  async deleteVehicleMaintenance(id: string, tenant: Tenant, user: User) {
    try {
      const existingRecord = await prisma.vehicleMaintenance.findUnique({
        where: { id },
      });

      if (!existingRecord) {
        throw new Error('Vehicle maintenance record not found');
      }

      const deletedMaintenance = await prisma.vehicleMaintenance.update({
        where: { id },
        data: {
          isDeleted: true,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });

      return deletedMaintenance;
    } catch (error) {
      logger.e(error, 'Error deleting vehicle maintenance', {
        maintenanceId: id,
        teatId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Could not delete vehicle maintenance');
    }
  }
}

export const vehicleMaintenanceService = new VehicleMaintenanceService();
