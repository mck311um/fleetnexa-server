import { Injectable, Logger } from '@nestjs/common';
import { TenantLocationService } from '../tenant-location/tenant-location.service';
import { Tenant } from 'prisma/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TenantExtra } from 'src/types/tenant';

@Injectable()
export class TenantExtraService {
  private readonly logger = new Logger(TenantLocationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTenantExtras(tenant: Tenant) {
    try {
      const [tenantServices, tenantEquipments, tenantInsurances] =
        await Promise.all([
          this.prisma.tenantService.findMany({
            where: { tenantId: tenant.id },
            include: { service: true },
          }),
          this.prisma.tenantEquipment.findMany({
            where: { tenantId: tenant.id },
            include: { equipment: true },
          }),
          this.prisma.tenantInsurance.findMany({
            where: { tenantId: tenant.id },
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
      this.logger.error('Failed to get tenant extras', error);
      throw error;
    }
  }
}
