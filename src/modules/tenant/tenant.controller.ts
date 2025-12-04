import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantService } from './tenant.service';
import type { AuthenticatedRequest } from 'src/types/authenticated-request';
import { AuthGuard } from 'src/common/guards/auth.guard';

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
