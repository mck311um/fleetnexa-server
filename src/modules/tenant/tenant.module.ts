import { Module } from '@nestjs/common';
import { GeneratorModule } from 'src/common/generator/generator.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TenantLocationModule } from './tenant-location/tenant-location.module';
import { UserRoleModule } from '../user/user-role/user-role.module';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { TenantUserModule } from '../user/tenant/tenant-user.module';
import { EmailModule } from '../email/email.module';
import { TenantRepository } from './tenant.repository';
import { TenantUserRepository } from '../user/tenant/tenant-user.repository';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { TenantExtrasModule } from './tenant-extras/tenant-extras.module';

@Module({
  imports: [
    PrismaModule,
    GeneratorModule,
    TenantLocationModule,
    TenantExtrasModule,
    TenantUserModule,
    UserRoleModule,
    EmailModule,
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
