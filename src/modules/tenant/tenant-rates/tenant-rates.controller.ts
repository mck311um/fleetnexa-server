import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { TenantRatesService } from './tenant-rates.service.js';
import type { AuthenticatedRequest } from '../../../types/authenticated-request.js';
import { TenantRateDto } from './tenant-rate.dto.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';

@Controller('tenant/rate')
@UseGuards(AuthGuard)
export class TenantRatesController {
  constructor(private readonly service: TenantRatesService) {}

  @Get()
  async getTenantRates(@Req() req: AuthenticatedRequest) {
    const tenant = req.context.tenant;
    return this.service.getTenantRates(tenant);
  }

  @Put()
  async updateTenantRate(
    @Req() req: AuthenticatedRequest,
    @Body('data') data: TenantRateDto,
  ) {
    const tenant = req.context.tenant;
    return this.service.updateTenantRate(data, tenant);
  }
}
