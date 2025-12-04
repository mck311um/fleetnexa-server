import { Module } from '@nestjs/common';
import { TenantNotificationController } from './tenant-notification.controller.js';
import { TenantNotificationService } from './tenant-notification.service.js';
import { FormatterModule } from '../../../common/formatter/formatter.module.js';
import { SocketModule } from '../../../gateway/socket.module.js';

@Module({
  imports: [FormatterModule, SocketModule],
  controllers: [TenantNotificationController],
  providers: [TenantNotificationService],
  exports: [TenantNotificationService],
})
export class TenantNotificationModule {}
