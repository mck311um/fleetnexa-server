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
import { TenantExtraService } from './tenant-extra.service.js';
import type { AuthenticatedRequest } from 'src/types/authenticated-request.js';
import { TenantExtraDto } from './tenant-extra.dto.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';

@Controller('tenant/extra')
@UseGuards(AuthGuard)
export class TenantExtraController {
  constructor(private readonly service: TenantExtraService) {}

  @Get()
  async getTenantExtras(@Req() req: AuthenticatedRequest) {
    const tenant = req.context.tenant;
    return this.service.getTenantExtras(tenant);
  }

  @Post()
  async addTenantExtra(
    @Req() req: AuthenticatedRequest,
    @Body('data') data: TenantExtraDto,
  ) {
    const tenant = req.context.tenant;
    const user = req.context.user;
    return this.service.createTenantExtra(data, tenant, user);
  }

  @Put()
  async updateTenantExtra(
    @Req() req: AuthenticatedRequest,
    @Body('data') data: TenantExtraDto,
  ) {
    const tenant = req.context.tenant;
    const user = req.context.user;
    return this.service.updateTenantExtra(data, tenant, user);
  }

  @Delete(':type/:id')
  async deleteTenantExtra(
    @Req() req: AuthenticatedRequest,
    @Param('type') type: 'service' | 'equipment' | 'insurance',
    @Param('id') id: string,
  ) {
    const tenant = req.context.tenant;
    const user = req.context.user;

    switch (type) {
      case 'service':
        return this.service.deleteService(id, tenant, user);
      case 'equipment':
        return this.service.deleteEquipment(id, tenant, user);
      case 'insurance':
        return this.service.deleteInsurance(id, tenant, user);
      default:
        throw new Error('Invalid tenant extra type');
    }
  }
}
