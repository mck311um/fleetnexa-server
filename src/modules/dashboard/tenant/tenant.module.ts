import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller.js';
import { TenantService } from './tenant.service.js';

@Module({
  imports: [],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
