import { Module } from '@nestjs/common';
import { TenantExtraService } from './tenant-extras.service.js';

@Module({
  imports: [],
  controllers: [],
  providers: [TenantExtraService],
  exports: [TenantExtraService],
})
export class TenantExtrasModule {}
