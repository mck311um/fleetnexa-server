import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTenants() {
    try {
      const tenants = await this.prisma.tenant.findMany({
        where: { isDeleted: false },
        select: {
          id: true,
          tenantName: true,
          tenantCode: true,
          slug: true,
          address: {
            select: {
              street: true,
              village: true,
              state: true,
              country: true,
            },
          },
          _count: {
            select: {
              vehicles: {
                where: { isDeleted: false },
              },
              users: {
                where: { isDeleted: false },
              },
            },
          },
        },
      });

      return tenants;
    } catch (error) {
      this.logger.error('Failed to fetch tenants', error);
      throw error;
    }
  }
}
