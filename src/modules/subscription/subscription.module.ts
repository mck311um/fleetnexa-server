import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller.js';
import { SubscriptionService } from './subscription.service.js';
import { TenantRepository } from '../tenant/tenant.repository.js';
import { TenantUserRepository } from '../user/tenant-user/tenant-user.repository.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';

@Module({
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    AuthGuard,
    TenantRepository,
    TenantUserRepository,
  ],
})
export class SubscriptionModule {}
