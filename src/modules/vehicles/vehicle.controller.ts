import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { VehicleService } from './vehicle.service.js';
import { ApiGuard } from '../../common/guards/api.guard.js';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly service: VehicleService) {}

  @Get('storefront')
  @UseGuards(ApiGuard)
  async getStorefrontVehicles() {
    return this.service.getStorefrontVehicles();
  }

  @Get('storefront/:id')
  @UseGuards(ApiGuard)
  async getVehicleForStorefrontById(@Param('id') id: string) {
    return this.service.getVehicleForStorefrontById(id);
  }
}
