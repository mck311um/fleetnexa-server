import { Tenant, User } from '@prisma/client';
import prisma from '../../../../config/prisma.config';
import { logger } from '../../../../config/logger';
import { VehicleDamageDto, VehicleDamageSchema } from './damage.dto';

class VehicleDamageService {
  validateVehicleDamage(data: any) {
    if (!data) {
      throw new Error('No data provided');
    }

    const safeParse = VehicleDamageSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Invalid vehicle damage data', {
        errors: safeParse.error.issues,
        data,
      });
      throw new Error('Invalid vehicle damage data');
    }

    return safeParse.data;
  }

  async getVehicleDamages(vehicleId: string, tenant: Tenant) {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId, tenantId: tenant.id },
      });

      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      const damages = await prisma.vehicleDamage.findMany({
        where: { vehicleId: vehicle.id, isDeleted: false },
        include: {
          customer: true,
        },
      });

      return damages;
    } catch (error) {
      logger.e(error, 'Error fetching vehicle damages', {
        vehicleId,
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to get vehicle damages');
    }
  }

  async addVehicleDamage(data: VehicleDamageDto, tenant: Tenant, user: User) {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: data.vehicleId, tenantId: tenant.id },
      });

      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      if (data.customerId) {
        const customer = await prisma.customer.findUnique({
          where: { id: data.customerId, tenantId: tenant.id },
        });

        if (!customer) {
          throw new Error('Customer not found');
        }
      }

      await prisma.vehicleDamage.create({
        data: {
          id: data.id,
          vehicleId: vehicle.id,
          description: data.description,
          images: data.images,
          isRepaired: data.isRepaired,
          partId: data.partId,
          customerId: data.customerId || null,
          location: data.location,
          title: data.title,
          severity: data.severity,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      logger.e(error, 'Error adding vehicle damage', {
        data,
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to add vehicle damage');
    }
  }

  async updateVehicleDamage(data: any, tenant: Tenant, user: User) {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: data.vehicleId, tenantId: tenant.id },
      });

      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      if (data.customerId) {
        const customer = await prisma.customer.findUnique({
          where: { id: data.customerId, tenantId: tenant.id },
        });
        if (!customer) {
          throw new Error('Customer not found');
        }
      }
      const damage = await prisma.vehicleDamage.findUnique({
        where: { id: data.id, vehicleId: vehicle.id, isDeleted: false },
      });
      if (!damage) {
        throw new Error('Damage record not found');
      }
      await prisma.vehicleDamage.update({
        where: { id: damage.id },
        data: {
          description: data.description,
          images: data.images,
          isRepaired: data.isRepaired,
          partId: data.partId,
          customerId: data.customerId || null,
          title: data.title,
          severity: data.severity,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });
    } catch (error) {
      logger.e(error, 'Error updating vehicle damage', {
        data,
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to update vehicle damage');
    }
  }

  async deleteVehicleDamage(damageId: string, tenant: Tenant, user: User) {
    try {
      const damage = await prisma.vehicleDamage.findUnique({
        where: { id: damageId, isDeleted: false },
        include: { vehicle: true },
      });

      if (!damage || damage.vehicle.tenantId !== tenant.id) {
        throw new Error('Damage record not found');
      }

      const updatedDamage = await prisma.vehicleDamage.update({
        where: { id: damage.id },
        data: {
          isDeleted: true,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });

      return updatedDamage;
    } catch (error) {
      logger.e(error, 'Error deleting vehicle damage', {
        damageId,
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to delete vehicle damage');
    }
  }
}

export const vehicleDamageService = new VehicleDamageService();
