import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import type { AuthenticatedRequest } from '../../../../types/authenticated-request.js';
import { PaymentDto } from './payment.dto.js';
import { AuthGuard } from '../../../../common/guards/auth.guard.js';

@Controller('payment')
@UseGuards(AuthGuard)
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Get()
  getPayments(@Req() req: AuthenticatedRequest) {
    const { tenant } = req.context;
    return this.service.getPayments(tenant);
  }

  @Post()
  createPayment(@Req() req: AuthenticatedRequest, @Body() data: PaymentDto) {
    const { tenant, user } = req.context;
    return this.service.createPayment(data, tenant, user);
  }

  @Put()
  updatePayment(@Req() req: AuthenticatedRequest, @Body() data: PaymentDto) {
    const { tenant, user } = req.context;
    return this.service.updatePayment(data, tenant, user);
  }
}
