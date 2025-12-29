import { Module } from '@nestjs/common';
import { VillageController } from './village.controller.js';
import { VillageService } from './village.service.js';

@Module({
  imports: [],
  providers: [VillageService],
  controllers: [VillageController],
  exports: [VillageService],
})
export class VillageModule {}
