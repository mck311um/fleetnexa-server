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
import { AuthGuard } from '../../../common/guards/auth.guard.js';
import { TenantVendorService } from './tenant-vendor.service.js';
import type { AuthenticatedRequest } from '../../../types/authenticated-request.js';
import { TenantVendorDto } from './tenant-vendor.dto.js';

@Controller('tenant/vendor')
@UseGuards(AuthGuard)
export class TenantVendorController {
  constructor(private readonly service: TenantVendorService) {}

  @Get()
  async getTenantVendors(@Req() req: AuthenticatedRequest) {
    const tenant = req.context.tenant;
    return this.service.getTenantVendors(tenant);
  }

  @Post()
  async createTenantVendor(
    @Req() req: AuthenticatedRequest,
    @Body() data: TenantVendorDto,
  ) {
    const tenant = req.context.tenant;
    return this.service.createTenantVendor(data, tenant);
  }

  @Put()
  async updateTenantVendor(
    @Req() req: AuthenticatedRequest,
    @Body() data: TenantVendorDto,
  ) {
    const { tenant, user } = req.context;
    return this.service.updateTenantVendor(data, tenant, user);
  }

  @Delete(':id')
  async deleteTenantVendor(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const { tenant, user } = req.context;
    return this.service.deleteTenantVendor(id, tenant, user);
  }
}
