import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { TenantCustomerRepository } from './tenant-customer.repository.js';
import { Tenant } from '../../../generated/prisma/client.js';

@Injectable()
export class TenantCustomerService {
  private readonly logger = new Logger(TenantCustomerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly customerRepo: TenantCustomerRepository,
  ) {}

  async getCustomers(tenant: Tenant) {
    try {
      return this.customerRepo.getCustomers(tenant.id);
    } catch (error) {
      this.logger.error(error, 'Error fetching customers', {
        tenantId: tenant.id,
      });
      throw error;
    }
  }
}
