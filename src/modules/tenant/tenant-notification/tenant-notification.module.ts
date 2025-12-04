import { Module } from '@nestjs/common';
import { TenantNotificationController } from './tenant-notification.controller.js';
import { TenantNotificationService } from './tenant-notification.service.js';
import { FormatterModule } from '../../../common/formatter/formatter.module.js';
import { SocketModule } from '../../../gateway/socket.module.js';
import { TenantRepository } from '../tenant.repository.js';
import { TenantUserRepository } from '../../../modules/user/tenant/tenant-user.repository.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';

@Module({
  imports: [FormatterModule, SocketModule],
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
