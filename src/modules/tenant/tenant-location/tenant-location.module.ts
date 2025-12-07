import { Module } from '@nestjs/common';
import { TenantLocationService } from './tenant-location.service.js';
import { TenantLocationController } from './tenant-location.controller.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';
import { TenantUserRepository } from '../../user/tenant-user/tenant-user.repository.js';
import { TenantRepository } from '../tenant.repository.js';

@Module({
  imports: [],
  controllers: [TenantLocationController],
  providers: [
    TenantLocationService,
    TenantRepository,
    TenantUserRepository,
    AuthGuard,
  ],
  exports: [TenantLocationService],
})
export class TenantLocationModule {}
