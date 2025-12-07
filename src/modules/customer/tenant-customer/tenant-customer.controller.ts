import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TenantCustomerService } from './tenant-customer.service.js';
import type { AuthenticatedRequest } from '../../../types/authenticated-request.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';

@Controller('tenant/customer')
@UseGuards(AuthGuard)
export class TenantCustomerController {
  constructor(private readonly service: TenantCustomerService) {}

  @Get()
  async getCustomers(@Req() req: AuthenticatedRequest) {
    const { tenant } = req.context;
    return this.service.getCustomers(tenant);
  }
}
