import { Module } from '@nestjs/common';
import { TenantUserService } from './tenant-user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GeneratorModule } from 'src/common/generator/generator.module';

@Module({
  imports: [GeneratorModule, PrismaModule],
  controllers: [],
  providers: [TenantUserService],
  exports: [TenantUserService],
})
export class TenantUserModule {}
