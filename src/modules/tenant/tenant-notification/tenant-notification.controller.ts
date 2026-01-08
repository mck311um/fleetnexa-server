import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TenantNotificationService } from './tenant-notification.service.js';
import type { AuthenticatedRequest } from '../../../types/authenticated-request.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';

@Controller('tenant/notification')
@UseGuards(AuthGuard)
export class TenantNotificationController {
  constructor(private readonly service: TenantNotificationService) {}

  @Get()
  async getNotifications(@Req() req: AuthenticatedRequest) {
    const { tenant, user } = req.context;
    return this.service.getTenantNotifications(tenant, user);
  }

  @Post()
  async markAllAsRead(@Req() req: AuthenticatedRequest) {
    const { tenant, user } = req.context;
    return this.service.markAllNotificationsAsRead(tenant, user);
  }

  @Post(':id')
  async markAsRead(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const { tenant, user } = req.context;
    return this.service.markNotificationAsRead(id, tenant, user);
  }

  @Delete(':id')
  async deleteNotification(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const { tenant, user } = req.context;
    return this.service.deleteNotification(id, tenant, user);
  }
}
