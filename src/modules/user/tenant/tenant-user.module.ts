import { Module } from '@nestjs/common';
import { GeneratorModule } from '../../../common/generator/generator.module.js';
import { PrismaModule } from '../../../prisma/prisma.module.js';
import { TenantUserService } from './tenant-user.service.js';

@Module({
  imports: [GeneratorModule, PrismaModule],
  controllers: [],
  providers: [TenantUserService],
  exports: [TenantUserService],
})
export class TenantUserModule {}
