import { Module } from '@nestjs/common';
import { GeneratorModule } from '../../common/generator/generator.module.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { TenantLocationModule } from './tenant-location/tenant-location.module.js';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { TenantUserModule } from '../user/tenant-user/tenant-user.module.js';
import { TenantUserRepository } from '../user/tenant-user/tenant-user.repository.js';
import { UserRoleModule } from '../user/user-role/user-role.module.js';
import { TenantExtrasModule } from './tenant-extra/tenant-extra.module.js';
import { TenantController } from './tenant.controller.js';
import { TenantRepository } from './tenant.repository.js';
import { TenantService } from './tenant.service.js';
import { TenantNotificationModule } from './tenant-notification/tenant-notification.module.js';
import { TenantVendorModule } from './tenant-vendor/tenant-vendor.module.js';
import { VehicleModule } from '../vehicle/vehicle.module.js';
import { TenantCustomerModule } from '../customer/tenant-customer/tenant-customer.module.js';
import { TenantActivityModule } from './tenant-activity/tenant-activity.module.js';
import { TenantRatesModule } from './tenant-rates/tenant-rates.module.js';

@Module({
  imports: [
    PrismaModule,
    GeneratorModule,
    TenantLocationModule,
    TenantExtrasModule,
    TenantUserModule,
    TenantNotificationModule,
    UserRoleModule,
    TenantVendorModule,
    VehicleModule,
    TenantCustomerModule,
    TenantActivityModule,
    TenantRatesModule,
  ],
  controllers: [TenantController],
  providers: [
    JwtService,
    TenantService,
    TenantRepository,
    TenantUserRepository,
    AuthGuard,
  ],
  exports: [
    PrismaModule,
    TenantService,
    TenantRepository,
    TenantUserRepository,
  ],
})
export class TenantModule {}
