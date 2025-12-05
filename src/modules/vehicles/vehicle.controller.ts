import { Controller, Get } from '@nestjs/common';
import { VehicleService } from './vehicle.service.js';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly service: VehicleService) {}

  @Get('storefront')
  async getStorefrontVehicles() {
    return this.service.getStorefrontVehicles();
  }

  @Get('storefront/:id')
  async getVehicleForStorefrontById(id: string) {
    return this.service.getVehicleForStorefrontById(id);
  }
}
