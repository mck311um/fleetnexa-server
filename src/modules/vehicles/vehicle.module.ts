import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { VehicleController } from './vehicle.controller.js';
import { VehicleService } from './vehicle.service.js';
import { VehicleRepository } from './vehicle.repository.js';
import { TenantExtrasModule } from '../tenant/tenant-extra/tenant-extra.module.js';

@Module({
  imports: [PrismaModule, TenantExtrasModule],
  controllers: [VehicleController],
  providers: [VehicleService, VehicleRepository],
  exports: [VehicleService],
})
export class VehicleModule {}
