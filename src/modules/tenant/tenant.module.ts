import { Module } from '@nestjs/common';
import { GeneratorModule } from '../../common/generator/generator.module.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { TenantLocationModule } from './tenant-location/tenant-location.module.js';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { TenantUserModule } from '../user/tenant/tenant-user.module.js';
import { TenantUserRepository } from '../user/tenant/tenant-user.repository.js';
import { UserRoleModule } from '../user/user-role/user-role.module.js';
import { TenantExtrasModule } from './tenant-extra/tenant-extra.module.js';
import { TenantController } from './tenant.controller.js';
import { TenantRepository } from './tenant.repository.js';
import { TenantService } from './tenant.service.js';

@Module({
  imports: [
    PrismaModule,
    GeneratorModule,
    TenantLocationModule,
    TenantExtrasModule,
    TenantUserModule,
    UserRoleModule,
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
