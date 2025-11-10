import { Tenant, User } from '@prisma/client';
import { logger } from '../../../../config/logger';
import {
  VehicleMaintenanceDto,
  VehicleMaintenanceSchema,
} from './vehicle-maintenance.dto';
import prisma from '../../../../config/prisma.config';
import { ExpenseDto } from '../../../transaction/modules/expense/expense.dto';
import { expenseService } from '../../../transaction/modules/expense/expense.service';

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

  async getTenantMaintenanceServices(tenant: Tenant) {
    try {
      const services = await prisma.vehicleMaintenance.findMany({
        where: { tenantId: tenant.id, isDeleted: false },
        include: {
          services: true,
          vendor: true,
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true,
            },
          },
        },
      });
      return services;
    } catch (error) {
      logger.e(error, 'Error fetching tenant maintenance services', {
        tenantId: tenant.id,
      });
      throw new Error('Could not fetch tenant maintenance services');
    }
  }

  async getVehicleMaintenances(vehicleId: string) {
    try {
      const maintenances = await prisma.vehicleMaintenance.findMany({
        where: { vehicleId, isDeleted: false },
        include: {
          services: true,
          vendor: true,
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true,
            },
          },
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
          vendorId: data.vendorId ?? null,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          cost: data.cost,
          tenantId: tenant.id,
          createdBy: user.username,
          services: {
            connect: data.services.map((serviceId) => ({ id: serviceId })),
          },
        },
      });
    } catch (error) {
      logger.e(error, 'Error adding vehicle maintenance', {
        tenantId: tenant.id,
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
          vendorId: data.vendorId || null,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          cost: data.cost,
          updatedAt: new Date(),
          updatedBy: user.username,
          status: data.status || existingRecord.status,
          tenantId: tenant.id,
          services: {
            set: data.services.map((id) => ({ id })),
          },
        },
      });
    } catch (error) {
      logger.e(error, 'Error updating vehicle maintenance', {
        tenantId: tenant.id,
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

  async completeVehicleMaintenance(
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

      const updatedRecord = await prisma.vehicleMaintenance.update({
        where: { id: data.id },
        data: {
          status: 'COMPLETED',
          endDate: new Date(data.endDate),
          cost: data.cost,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
        include: {
          services: true,
          vehicle: {
            include: { brand: true, model: true },
          },
          vendor: true,
        },
      });

      if (data.recordExpense) {
        const desc = `Maintenance ${updatedRecord.vehicle.year} ${updatedRecord.vehicle.brand.brand} ${updatedRecord.vehicle.model.model} (${updatedRecord.vehicle.licensePlate})`;
        const payee = updatedRecord.vendor
          ? updatedRecord.vendor.vendor
          : 'Unknown Vendor';
        const note = updatedRecord.services
          .map((service) => service.service)
          .join(', ');

        const expense: ExpenseDto = {
          id: data.id,
          vehicleId: data.vehicleId,
          vendorId: data.vendorId,
          amount: data.cost,
          maintenanceId: data.id,
          notes: note,
          expenseDate: data.expenseDate
            ? new Date(data.expenseDate).toISOString()
            : new Date().toISOString(),
          expense: desc,
          payee,
        };

        await expenseService.createExpense(expense, tenant, user);
      }
    } catch (error) {
      logger.e(error, 'Error completing vehicle maintenance', {
        teatId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Could not complete vehicle maintenance');
    }
  }
}

export const vehicleMaintenanceService = new VehicleMaintenanceService();
