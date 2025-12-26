import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VehicleDamageService } from './vehicle-damage.service.js';
import { AuthGuard } from '../../../../common/guards/auth.guard.js';
import type { AuthenticatedRequest } from 'src/types/authenticated-request.js';
import { VehicleDamageDto } from './vehicle-damage.dto.js';

@Controller('vehicle/damage')
@UseGuards(AuthGuard)
export class VehicleDamageController {
  constructor(private readonly service: VehicleDamageService) {}

  @Get(':id')
  async getVehicleDamages(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const { tenant } = req.context;
    return this.service.getVehicleDamages(id, tenant);
  }

  @Post()
  async addVehicleDamage(
    @Req() req: AuthenticatedRequest,
    @Body() data: VehicleDamageDto,
  ) {
    const { tenant, user } = req.context;
    return this.service.addVehicleDamage(data, tenant, user);
  }

  @Put()
  async updateVehicleDamage(
    @Req() req: AuthenticatedRequest,
    @Body() data: VehicleDamageDto,
  ) {
    const { tenant, user } = req.context;
    return this.service.updateVehicleDamage(data, tenant, user);
  }

  @Delete(':id')
  async deleteVehicleDamage(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const { tenant, user } = req.context;
    return this.service.deleteVehicleDamage(id, tenant, user);
  }
}
