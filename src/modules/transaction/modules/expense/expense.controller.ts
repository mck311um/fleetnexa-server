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
import { ExpenseService } from './expense.service.js';
import { AuthGuard } from '../../../../common/guards/auth.guard.js';
import type { AuthenticatedRequest } from '../../../../types/authenticated-request.js';
import { ExpenseDto } from './expense.dto.js';

@Controller('transaction/expense')
@UseGuards(AuthGuard)
export class ExpenseController {
  constructor(private readonly service: ExpenseService) {}

  @Get()
  async getExpenses(@Req() req: AuthenticatedRequest) {
    const { tenant } = req.context;
    return this.service.getTenantExpenses(tenant);
  }

  @Post()
  async createExpense(
    @Req() req: AuthenticatedRequest,
    @Body() data: ExpenseDto,
  ) {
    const { tenant, user } = req.context;
    return this.service.createExpense(data, tenant, user);
  }

  @Put()
  async updateExpense(
    @Req() req: AuthenticatedRequest,
    @Body() data: ExpenseDto,
  ) {
    const { tenant, user } = req.context;
    return this.service.updateExpense(data, tenant, user);
  }

  @Delete(':id')
  async deleteExpense(
    @Req() req: AuthenticatedRequest,
    @Param('id') expenseId: string,
  ) {
    const { tenant, user } = req.context;
    return this.service.deleteExpense(expenseId, tenant, user);
  }
}
