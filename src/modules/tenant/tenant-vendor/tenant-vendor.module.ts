import { Module } from '@nestjs/common';
import { TenantVendorController } from './tenant-vendor.controller.js';
import { TenantVendorService } from './tenant-vendor.service.js';
import { TenantRepository } from '../tenant.repository.js';
import { TenantUserRepository } from '../../../modules/user/tenant/tenant-user.repository.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';

@Module({
  imports: [],
  controllers: [TenantVendorController],
  providers: [
    TenantVendorService,
    TenantRepository,
    TenantUserRepository,
    AuthGuard,
  ],
  exports: [TenantVendorService],
})
export class TenantVendorModule {}
