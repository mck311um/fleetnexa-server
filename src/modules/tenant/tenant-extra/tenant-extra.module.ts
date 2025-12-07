import { Module } from '@nestjs/common';
import { TenantExtraService } from './tenant-extra.service.js';
import { TenantExtraController } from './tenant-extra.controller.js';
import { TenantRepository } from '../tenant.repository.js';
import { TenantUserRepository } from '../../user/tenant-user/tenant-user.repository.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';

@Module({
  imports: [],
  controllers: [TenantExtraController],
  providers: [
    TenantExtraService,
    TenantRepository,
    TenantUserRepository,
    AuthGuard,
  ],
  exports: [TenantExtraService],
})
export class TenantExtrasModule {}
