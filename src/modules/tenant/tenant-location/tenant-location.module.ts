import { Module } from '@nestjs/common';
import { TenantLocationService } from './tenant-location.service.js';

@Module({
  imports: [],
  controllers: [],
  providers: [TenantLocationService],
  exports: [TenantLocationService],
})
export class TenantLocationModule {}
