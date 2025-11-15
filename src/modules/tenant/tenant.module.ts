import { Module } from '@nestjs/common';
import { GeneratorModule } from 'src/common/generator/generator.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TenantLocationModule } from './tenant-location/tenant-location.module';
import { UserRoleModule } from '../user/user-role/user-role.module';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { TenantUserModule } from '../user/tenant/tenant-user.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PrismaModule,
    GeneratorModule,
    TenantLocationModule,
    TenantUserModule,
    UserRoleModule,
    EmailModule,
  ],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [PrismaModule, TenantService],
})
export class TenantModule {}
