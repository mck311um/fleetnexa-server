import { Controller, Get } from '@nestjs/common';
import { TenantService } from './tenant.service.js';

@Controller('dashboard/tenant')
export class TenantController {
  constructor(private readonly service: TenantService) {}

  @Get()
  async getTenants() {
    return this.service.getTenants();
  }
}
