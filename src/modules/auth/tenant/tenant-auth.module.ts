import { Module } from '@nestjs/common';
import { GeneratorModule } from 'src/common/generator/generator.module';
import { UserModule } from 'src/modules/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TenantAuthController } from './tenant-auth.controller';
import { TenantAuthService } from './tenant-auth.service';

@Module({
  imports: [UserModule, GeneratorModule, PrismaModule],
  providers: [TenantAuthService],
  controllers: [TenantAuthController],
  exports: [TenantAuthService],
})
export class TenantAuthModule {}
