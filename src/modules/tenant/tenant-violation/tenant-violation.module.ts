import { Module } from '@nestjs/common';
import { TenantViolationService } from './tenant-violation.service.js';
import { TenantRepository } from '../tenant.repository.js';
import { TenantUserRepository } from '../../user/tenant-user/tenant-user.repository.js';
import { TenantViolationController } from './tenant-violation.controller.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';

@Module({
  imports: [],
  controllers: [TenantViolationController],
  providers: [
    TenantViolationService,
    AuthGuard,
    TenantRepository,
    TenantUserRepository,
  ],
  exports: [TenantViolationService],
})
export class TenantViolationModule {}
