import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { TenantService } from './tenant.service.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import type { AuthenticatedRequest } from '../../types/authenticated-request.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  @UseGuards(AuthGuard)
  getCurrentTenant(@Req() req: AuthenticatedRequest) {
    const tenant = req.context.tenant;
    return this.tenantService.getCurrentTenant(tenant);
  }

  @Get(':id')
  getTenantById(@Param('id') id: string) {
    return this.tenantService.getTenantById(id);
  }

  @Post()
  createTenant(@Body('data') data: CreateTenantDto) {
    return this.tenantService.createTenant(data);
  }
}
