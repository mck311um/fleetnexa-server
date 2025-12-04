import { Module } from '@nestjs/common';
import { UserModule } from '../../user/user.module.js';
import { TenantAuthService } from './tenant-auth.service.js';
import { TenantAuthController } from './tenant-auth.controller.js';
import { GeneratorModule } from '../../../common/generator/generator.module.js';
import { PrismaModule } from '../../../prisma/prisma.module.js';

@Module({
  imports: [UserModule, GeneratorModule, PrismaModule],
  providers: [TenantAuthService],
  controllers: [TenantAuthController],
  exports: [TenantAuthService],
})
export class TenantAuthModule {}
