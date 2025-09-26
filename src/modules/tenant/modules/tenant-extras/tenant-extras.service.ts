import { Tenant, User } from '@prisma/client';
import { logger } from '../../../../config/logger';
import prisma from '../../../../config/prisma.config';
import { TenantExtra } from '../../../../types/tenant';
import { TenantExtraDto } from './tenant-extras.dto';

class TenantExtraService {
  async getTenantExtras(tenantId: string) {
    try {
      const [tenantServices, tenantEquipments, tenantInsurances] =
        await Promise.all([
          prisma.tenantService.findMany({
            where: { tenantId: tenantId, isDeleted: false },
            include: { service: true },
          }),
          prisma.tenantEquipment.findMany({
            where: { tenantId: tenantId, isDeleted: false },
            include: { equipment: true },
          }),
          prisma.tenantInsurance.findMany({
            where: { tenantId: tenantId, isDeleted: false },
          }),
        ]);

      const combined: TenantExtra[] = [
        ...tenantServices.map((item) => ({
          ...item,
          type: 'service' as const,
          item: item.service.id,
          name: item.service.service,
          icon: item.service.icon,
          description: item.service.description,
        })),
        ...tenantInsurances.map((item) => ({
          ...item,
          type: 'insurance' as const,
          item: item.insurance,
          name: item.insurance,
          icon: 'FaShieldAlt',
          description: item.description,
        })),
        ...tenantEquipments.map((item) => ({
          ...item,
          type: 'equipment' as const,
          item: item.equipment.id,
          name: item.equipment.equipment,
          icon: item.equipment.icon,
          description: item.equipment.description,
        })),
      ];

      return combined;
    } catch (error) {
      logger.e(error, 'Failed to get tenant extras', {
        tenantId,
      });
      throw new Error('Failed to get tenant extras');
    }
  }

  async addTenantExtra(data: TenantExtraDto, tenant: Tenant, user: User) {
    try {
      if (data.type === 'service') {
        const existingService = await prisma.service.findFirst({
          where: {
            id: data.item,
          },
        });

        if (!existingService) {
          throw new Error('Service not found');
        }

        await prisma.tenantService.create({
          data: {
            id: data.id,
            serviceId: data.item,
            tenantId: tenant.id,
            pricePolicy: data.pricePolicy,
            price: data.price,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: user.username,
          },
        });
      } else if (data.type === 'equipment') {
        const existingEquipment = await prisma.equipment.findFirst({
          where: {
            id: data.item,
          },
        });

        if (!existingEquipment) {
          throw new Error('Equipment not found');
        }

        await prisma.tenantEquipment.create({
          data: {
            id: data.id,
            equipmentId: data.item,
            tenantId: tenant.id,
            pricePolicy: data.pricePolicy,
            price: data.price,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: user.username,
          },
        });
      } else if (data.type === 'insurance') {
        const existingInsurance = await prisma.tenantInsurance.findFirst({
          where: {
            id: data.id,
            tenantId: tenant.id,
            insurance: data.item,
            isDeleted: false,
          },
        });

        if (existingInsurance) {
          throw new Error('Insurance already exists for this tenant');
        }

        await prisma.tenantInsurance.create({
          data: {
            insurance: data.item,
            description: data.description || '',
            tenantId: tenant.id,
            pricePolicy: data.pricePolicy,
            price: data.price,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: user.username,
          },
        });
      }
    } catch (error) {
      logger.e(error, 'Failed to add tenant extra', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw new Error('Failed to add tenant extra');
    }
  }

  async updateTenantExtra(data: TenantExtraDto, tenant: Tenant, user: User) {
    try {
      if (data.type === 'service') {
        const existingService = await prisma.tenantService.findFirst({
          where: {
            id: data.id,
            tenantId: tenant.id,
            isDeleted: false,
          },
        });

        if (!existingService) {
          throw new Error('Tenant service not found');
        }

        await prisma.tenantService.update({
          where: { id: data.id },
          data: {
            pricePolicy: data.pricePolicy,
            price: data.price,
            updatedAt: new Date(),
            updatedBy: user.username,
          },
        });
      } else if (data.type === 'equipment') {
        const existingEquipment = await prisma.tenantEquipment.findFirst({
          where: {
            id: data.id,
            tenantId: tenant.id,
            isDeleted: false,
          },
        });

        if (!existingEquipment) {
          throw new Error('Tenant equipment not found');
        }

        await prisma.tenantEquipment.update({
          where: { id: data.id },
          data: {
            pricePolicy: data.pricePolicy,
            price: data.price,
            updatedAt: new Date(),
            updatedBy: user.username,
          },
        });
      } else if (data.type === 'insurance') {
        const existingInsurance = await prisma.tenantInsurance.findFirst({
          where: {
            id: data.id,
            tenantId: tenant.id,
            isDeleted: false,
          },
        });

        if (!existingInsurance) {
          throw new Error('Tenant insurance not found');
        }

        await prisma.tenantInsurance.update({
          where: { id: data.id },
          data: {
            description: data.description || '',
            pricePolicy: data.pricePolicy,
            price: data.price,
            updatedAt: new Date(),
            updatedBy: user.username,
          },
        });
      }
    } catch (error) {
      logger.e(error, 'Failed to update tenant extra', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw new Error('Failed to update tenant extra');
    }
  }

  async deleteService(id: string, tenant: Tenant, user: User) {
    try {
      const existingService = await prisma.tenantService.findFirst({
        where: {
          id: id,
          tenantId: tenant.id,
          isDeleted: false,
        },
      });

      if (!existingService) {
        throw new Error('Tenant service not found');
      }

      await prisma.tenantService.update({
        where: { id: id },
        data: {
          isDeleted: true,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });
    } catch (error) {
      logger.e(error, 'Failed to delete tenant service', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        id,
      });
      throw new Error('Failed to delete tenant service');
    }
  }

  async deleteEquipment(id: string, tenant: Tenant, user: User) {
    try {
      const existingEquipment = await prisma.tenantEquipment.findFirst({
        where: {
          id: id,
          tenantId: tenant.id,
          isDeleted: false,
        },
      });

      if (!existingEquipment) {
        throw new Error('Tenant equipment not found');
      }

      await prisma.tenantEquipment.update({
        where: { id: id },
        data: {
          isDeleted: true,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });
    } catch (error) {
      logger.e(error, 'Failed to delete tenant equipment', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        id,
      });
      throw new Error('Failed to delete tenant equipment');
    }
  }

  async deleteInsurance(id: string, tenant: Tenant, user: User) {
    try {
      const existingInsurance = await prisma.tenantInsurance.findFirst({
        where: {
          id: id,
          tenantId: tenant.id,
          isDeleted: false,
        },
      });

      if (!existingInsurance) {
        throw new Error('Tenant insurance not found');
      }

      await prisma.tenantInsurance.update({
        where: { id: id },
        data: {
          isDeleted: true,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });
    } catch (error) {
      logger.e(error, 'Failed to delete tenant insurance', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        id,
      });
      throw new Error('Failed to delete tenant insurance');
    }
  }
}

export const tenantExtraService = new TenantExtraService();
