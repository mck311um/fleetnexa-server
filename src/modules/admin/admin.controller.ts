import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service.js';

@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('storefront')
  async getStorefrontData() {
    return this.service.getStorefrontData();
  }
}
