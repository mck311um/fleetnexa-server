import { Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { TenantUserService } from './tenant-user.service.js';
import type { AuthenticatedRequest } from '../../../types/authenticated-request.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';

@Controller('user/tenant')
@UseGuards(AuthGuard)
export class TenantUserController {
  private readonly logger = new Logger(TenantUserController.name);

  constructor(private readonly service: TenantUserService) {}

  @Get('me')
  async getCurrentUser(@Req() req: AuthenticatedRequest) {
    const { user, tenant } = req.context;
    return this.service.getCurrentUser(user.id, tenant);
  }
}
