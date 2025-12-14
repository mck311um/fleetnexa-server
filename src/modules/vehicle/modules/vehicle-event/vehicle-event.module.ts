import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../prisma/prisma.module.js';
import { VehicleEventService } from './vehicle-event.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [VehicleEventService],
  exports: [VehicleEventService],
})
export class VehicleEventModule {}
