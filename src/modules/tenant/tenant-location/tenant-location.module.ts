import { Module } from '@nestjs/common';
import { TenantModule } from '../tenant.module';
import { TenantLocationService } from './tenant-location.service';

@Module({
  imports: [],
  controllers: [],
  providers: [TenantLocationService],
  exports: [TenantLocationService],
})
export class TenantLocationModule {}
