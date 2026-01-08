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
import { RefundService } from './refund.service.js';
import { AuthGuard } from '../../../../common/guards/auth.guard.js';
import type { AuthenticatedRequest } from '../../../../types/authenticated-request.js';
import { RefundDto } from './refund.dto.js';

@Controller('transaction/refund')
@UseGuards(AuthGuard)
export class RefundController {
  constructor(private readonly service: RefundService) {}

  @Get()
  async getRefunds(@Req() req: AuthenticatedRequest) {
    const { tenant } = req.context;
    return this.service.getTenantRefunds(tenant);
  }

  @Post()
  async createRefund(
    @Req() req: AuthenticatedRequest,
    @Body() data: RefundDto,
  ) {
    const { tenant, user } = req.context;
    return this.service.createRefund(data, tenant, user);
  }

  @Put()
  async updateRefund(
    @Req() req: AuthenticatedRequest,
    @Body() data: RefundDto,
  ) {
    const { tenant, user } = req.context;
    return this.service.updateRefund(data, tenant, user);
  }

  @Delete(':id')
  async deleteRefund(
    @Req() req: AuthenticatedRequest,
    @Param('id') refundId: string,
  ) {
    const { tenant, user } = req.context;
    return this.service.deleteRefund(refundId, tenant, user);
  }
}
