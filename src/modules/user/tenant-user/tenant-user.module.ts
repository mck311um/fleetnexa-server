import { Module } from '@nestjs/common';
import { GeneratorModule } from '../../../common/generator/generator.module.js';
import { PrismaModule } from '../../../prisma/prisma.module.js';
import { TenantUserService } from './tenant-user.service.js';
import { TenantUserController } from './tenant-user.controller.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';
import { TenantRepository } from '../../../modules/tenant/tenant.repository.js';
import { TenantUserRepository } from './tenant-user.repository.js';
import { EmailModule } from '../../../common/email/email.module.js';

@Module({
  imports: [GeneratorModule, PrismaModule, EmailModule],
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
