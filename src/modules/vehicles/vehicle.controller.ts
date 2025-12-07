import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service.js';
import { ApiGuard } from '../../common/guards/api.guard.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import type { AuthenticatedRequest } from '../../types/authenticated-request.js';
import { VehicleStatusDto } from './dto/vehicle-status.dto.js';
import { VehicleDto } from './dto/vehicle.dto.js';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly service: VehicleService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getTenantVehicles(@Req() req: AuthenticatedRequest) {
    const { tenant } = req.context;
    return this.service.getTenantVehicles(tenant);
  }

  @Get('plate/:plate')
  @UseGuards(AuthGuard)
  async getVehicleByLicensePlate(
    @Param('plate') licensePlate: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const { tenant } = req.context;
    return this.service.getVehicleByLicensePlate(licensePlate, tenant);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getVehicleById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const { tenant } = req.context;
    return this.service.getVehicleById(id, tenant);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createVehicle(
    @Req() req: AuthenticatedRequest,
    @Body() data: VehicleDto,
  ) {
    const { tenant, user } = req.context;
    return this.service.addVehicle(data, tenant, user);
  }

  @Put()
  @UseGuards(AuthGuard)
  async updateVehicle(
    @Req() req: AuthenticatedRequest,
    @Body() data: VehicleDto,
  ) {
    const { tenant, user } = req.context;
    return this.service.updateVehicle(data, tenant, user);
  }

  @Patch('status')
  @UseGuards(AuthGuard)
  async updateVehicleStatus(
    @Req() req: AuthenticatedRequest,
    @Body() data: VehicleStatusDto,
  ) {
    const { tenant, user } = req.context;
    return this.service.updateVehicleStatus(data, tenant, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteVehicle(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const { tenant, user } = req.context;
    return this.service.deleteVehicle(id, tenant, user);
  }

  @Patch(':id/storefront')
  @UseGuards(AuthGuard)
  async updateVehicleStorefrontStatus(@Req() req: AuthenticatedRequest) {
    const { tenant, user } = req.context;
    const { vehicleId } = req.body;
    return this.service.updateVehicleStorefrontStatus(vehicleId, tenant, user);
  }

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
