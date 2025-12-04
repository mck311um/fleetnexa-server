import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { Tenant } from 'src/generated/prisma/client.js';

@Injectable()
export class TenantReviewService {
  private readonly logger = new Logger(TenantReviewService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTenantReviews(tenant: Tenant) {
    try {
      const reviews = await this.prisma.tenantRatings.findMany({
        where: { tenantId: tenant.id },
      });
      return reviews;
    } catch (error) {
      this.logger.error(error, 'Error fetching tenant reviews', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }
}
