import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantService } from './tenant.service';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  createTenant(@Body('data') data: CreateTenantDto) {
    return this.tenantService.createTenant(data);
  }
}
