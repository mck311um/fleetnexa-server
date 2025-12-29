import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { TenantAuthService } from './tenant-auth.service.js';
import { TenantLoginDto } from './dto/login.dto.js';

@Controller('auth/tenant')
export class TenantAuthController {
  constructor(private readonly authService: TenantAuthService) {}

  @Post('login')
  createTenant(@Body() data: TenantLoginDto) {
    return this.authService.login(data);
  }
}
