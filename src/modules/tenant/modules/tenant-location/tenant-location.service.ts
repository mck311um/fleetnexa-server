import { Tenant } from '@prisma/client';
import prisma from '../../../../config/prisma.config';

class TenantLocationService {
  async getAllLocations(tenant: Tenant) {
    try {
      const locations = await prisma.tenantLocation.findMany({
        where: { tenantId: tenant.id, isDeleted: false },
        include: {
          _count: {
            select: { vehicles: true },
          },
        },
      });

      return locations;
    } catch (error) {
      throw new Error('Failed to get tenant locations');
    }
  }
}

export const tenantLocationService = new TenantLocationService();
