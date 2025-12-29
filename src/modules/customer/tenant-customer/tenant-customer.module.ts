import { Module } from '@nestjs/common';
import { TenantCustomerController } from './tenant-customer.controller.js';
import { TenantCustomerService } from './tenant-customer.service.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';
import { TenantRepository } from '../../../modules/tenant/tenant.repository.js';
import { TenantUserRepository } from '../../../modules/user/tenant-user/tenant-user.repository.js';
import { TenantCustomerRepository } from './tenant-customer.repository.js';

@Module({
  imports: [],
  controllers: [TenantCustomerController],
  providers: [
    TenantCustomerService,
    AuthGuard,
    TenantRepository,
    TenantUserRepository,
    TenantCustomerRepository,
  ],
  exports: [TenantCustomerService],
})
export class TenantCustomerModule {}
