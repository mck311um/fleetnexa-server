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
import { TenantLocationService } from './tenant-location.service.js';
import type { AuthenticatedRequest } from 'src/types/authenticated-request.js';
import { TenantLocationDto } from './tenant.location.dto.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';

@Controller('tenant/location')
@UseGuards(AuthGuard)
export class TenantLocationController {
  constructor(private readonly service: TenantLocationService) {}

  @Get()
  async getAllTenantLocations(@Req() req: AuthenticatedRequest) {
    const tenant = req.context.tenant;
    return this.service.getAllTenantLocations(tenant);
  }

  @Post()
  async createTenantLocation(
    @Req() req: AuthenticatedRequest,
    @Body('data') data: TenantLocationDto,
  ) {
    const tenant = req.context.tenant;
    return this.service.createTenantLocation(data, tenant);
  }

  @Put()
  async updateTenantLocation(
    @Req() req: AuthenticatedRequest,
    @Body('data') data: TenantLocationDto,
  ) {
    const { tenant, user } = req.context;
    return this.service.updateTenantLocation(data, tenant, user);
  }

  @Delete(':id')
  async deleteTenantLocation(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const { tenant, user } = req.context;
    return this.service.deleteTenantLocation(id, tenant, user);
  }
}
