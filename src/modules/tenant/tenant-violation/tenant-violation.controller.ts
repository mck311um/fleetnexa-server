import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { TenantViolationService } from './tenant-violation.service.js';
import type { AuthenticatedRequest } from '../../../types/authenticated-request.js';
import { TenantViolationDto } from './tenant-violation.dto.js';

@Controller('tenant/violation')
export class TenantViolationController {
  constructor(private readonly service: TenantViolationService) {}

  @Get()
  async getTenantViolations(@Req() req: AuthenticatedRequest) {
    const tenant = req.context.tenant!;
    return this.service.getTenantViolations(tenant);
  }

  @Post()
  async createViolation(
    @Req() req: AuthenticatedRequest,
    @Body('data') data: TenantViolationDto,
  ) {
    const tenant = req.context.tenant!;
    return this.service.createViolation(data, tenant);
  }

  @Put()
  async updateViolation(
    @Req() req: AuthenticatedRequest,
    @Body('data') data: TenantViolationDto,
  ) {
    const tenant = req.context.tenant!;
    return this.service.updateViolation(data, tenant);
  }

  @Delete(':id')
  async deleteViolation(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const tenant = req.context.tenant!;
    return this.service.deleteViolation(id, tenant);
  }
}
