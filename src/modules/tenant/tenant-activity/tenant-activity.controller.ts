import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../common/guards/auth.guard.js';
import { TenantActivityService } from './tenant-activity.service.js';
import type { AuthenticatedRequest } from '../../../types/authenticated-request.js';

@Controller('tenant/activity')
@UseGuards(AuthGuard)
export class TenantActivityController {
  constructor(private readonly service: TenantActivityService) {}

  @Get()
  async getActivities(@Req() req: AuthenticatedRequest) {
    const tenant = req.context.tenant;
    return this.service.getTenantActivities(tenant);
  }
}
