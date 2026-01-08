import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import type { AuthenticatedRequest } from '../../types/authenticated-request.js';

@Controller('transaction')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Get()
  getTransactions(@Req() req: AuthenticatedRequest) {
    const { tenant } = req.context;
    return this.service.getTransactions(tenant);
  }
}
