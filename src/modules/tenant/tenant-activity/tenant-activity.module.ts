import { Module } from '@nestjs/common';
import { TenantActivityController } from './tenant-activity.controller.js';
import { TenantActivityService } from './tenant-activity.service.js';
import { TenantRepository } from '../tenant.repository.js';
import { TenantUserRepository } from '../../../modules/user/tenant/tenant-user.repository.js';

@Module({
  imports: [],
  controllers: [TenantActivityController],
  providers: [TenantActivityService, TenantRepository, TenantUserRepository],
  exports: [TenantActivityService],
})
export class TenantActivityModule {}
