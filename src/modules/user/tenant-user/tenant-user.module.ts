import { Module } from '@nestjs/common';
import { TenantUserService } from './tenant-user.service.js';
import { TenantUserController } from './tenant-user.controller.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';
import { TenantRepository } from '../../../modules/tenant/tenant.repository.js';
import { TenantUserRepository } from './tenant-user.repository.js';

@Module({
  imports: [],
  controllers: [TenantUserController],
  providers: [
    TenantUserService,
    AuthGuard,
    TenantRepository,
    TenantUserRepository,
  ],
  exports: [TenantUserService],
})
export class TenantUserModule {}
