import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { ExpenseDto } from './expense.dto.js';
import {
  Tenant,
  TransactionType,
  User,
} from '../../../../generated/prisma/client.js';
import { TransactionDto } from '../../transaction.dto.js';
import { v4 as uuidv4 } from 'uuid';
import { TransactionService } from '../../transaction.service.js';

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transaction: TransactionService,
  ) {}

  async createExpense(data: ExpenseDto, tenant: Tenant, user: User) {
    try {
      await this.prisma.expense.create({
        data: {
          id: data.id,
          amount: data.amount,
          expenseDate: data.expenseDate,
          notes: data.notes,
          vendorId: data.vendorId,
          vehicleId: data.vehicleId,
          tenantId: tenant.id,
          maintenanceId: data.maintenanceId,
          createdBy: user.username,
          expense: data.expense,
          payee: data.payee,
        },
      });

      const transaction: TransactionDto = {
        id: uuidv4(),
        amount: data.amount,
        type: TransactionType.EXPENSE,
        transactionDate: data.expenseDate,
        expenseId: data.id,
        createdBy: user.username,
        paymentId: '',
        refundId: '',
        rentalId: '',
      };

      await this.transaction.createTransaction(transaction, tenant, user);
    } catch (error) {
      this.logger.error(error, 'Failed to create expense', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw error;
    }
  }
}
