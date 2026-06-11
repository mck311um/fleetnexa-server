import { Module } from '@nestjs/common';
import { VehicleModelService } from './vehicle-model.service';
import { VehicleModelController } from './vehicle-model.controller';

@Module({
  controllers: [VehicleModelController],
  providers: [VehicleModelService],
})
export class VehicleModelModule {}
