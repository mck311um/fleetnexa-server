import { Module } from '@nestjs/common';
import { TenantNotificationController } from './tenant-notification.controller.js';
import { TenantNotificationService } from './tenant-notification.service.js';
import { SocketModule } from '../../../gateway/socket.module.js';
import { TenantRepository } from '../tenant.repository.js';
import { TenantUserRepository } from '../../user/tenant-user/tenant-user.repository.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';

@Module({
  imports: [SocketModule],
  controllers: [TenantNotificationController],
  providers: [
    TenantNotificationService,
    TenantRepository,
    TenantUserRepository,
    AuthGuard,
  ],
  exports: [TenantNotificationService],
})
export class TenantNotificationModule {}
