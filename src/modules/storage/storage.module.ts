import { Module } from '@nestjs/common';
import { AwsModule } from '../../common/aws/aws.module.js';
import { StorageController } from './storage.controller.js';
import { StorageService } from './storage.service.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { ApiGuard } from '../../common/guards/api.guard.js';
import { TenantRepository } from '../tenant/tenant.repository.js';
import { TenantUserRepository } from '../user/tenant-user/tenant-user.repository.js';

@Module({
  imports: [AwsModule],
  controllers: [StorageController],
  providers: [
    StorageService,
    AuthGuard,
    ApiGuard,
    TenantRepository,
    TenantUserRepository,
  ],
  exports: [StorageService],
})
export class StorageModule {}
