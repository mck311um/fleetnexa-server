import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { VehicleController } from './vehicle.controller.js';
import { VehicleService } from './vehicle.service.js';
import { VehicleRepository } from './vehicle.repository.js';
import { TenantExtrasModule } from '../tenant/tenant-extra/tenant-extra.module.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { TenantRepository } from '../tenant/tenant.repository.js';
import { TenantUserRepository } from '../user/tenant-user/tenant-user.repository.js';
import { StorageModule } from '../storage/storage.module.js';

@Module({
  imports: [PrismaModule, TenantExtrasModule, StorageModule],
  controllers: [VehicleController],
  providers: [
    VehicleService,
    VehicleRepository,
    AuthGuard,
    TenantRepository,
    TenantUserRepository,
  ],
  exports: [VehicleService],
})
export class VehicleModule {}
