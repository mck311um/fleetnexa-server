import { logger } from '../../../../config/logger';
import prisma from '../../../../config/prisma.config';
import { TenantExtra } from '../../../../types/tenant';

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
          type: 'Service' as const,
          name: item.service.service,
          icon: item.service.icon,
          description: item.service.description,
        })),
        ...tenantInsurances.map((item) => ({
          ...item,
          type: 'Insurance' as const,
          name: item.insurance,
          icon: 'FaShieldAlt',
          description: item.description,
        })),
        ...tenantEquipments.map((item) => ({
          ...item,
          type: 'Equipment' as const,
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
}

export const tenantExtraService = new TenantExtraService();
