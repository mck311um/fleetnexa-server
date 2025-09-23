import { Tenant } from '@prisma/client';
import prisma from '../../../../config/prisma.config';

class TenantActivityService {
  async getTenantActivities(tenant: Tenant) {
    try {
      const activities = await prisma.rentalActivity.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          vehicle: {
            select: {
              brand: true,
              model: true,
            },
          },
          customer: true,
        },
      });

      return activities;
    } catch (error) {
      console.error('Error fetching tenant activities:', error);
      throw new Error('Failed to fetch tenant activities');
    }
  }
}

export const tenantActivityService = new TenantActivityService();
