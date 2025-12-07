import { Injectable, Logger } from '@nestjs/common';
import { PrismaService, TxClient } from '../../prisma/prisma.service.js';
import { TransactionDto } from './transaction.dto.js';
import { Tenant, User } from '../../generated/prisma/client.js';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(data: TransactionDto, tenant: Tenant, user: User) {
    try {
      await this.prisma.$transaction(async (tx: TxClient) => {
        await tx.transactions.create({
          data: {
            id: data.id,
            amount: data.amount,
            type: data.type,
            transactionDate: data.transactionDate,
            createdBy: user.username,
            paymentId: data.paymentId,
            refundId: data.refundId,
            expenseId: data.expenseId,
            tenantId: tenant.id,
            rentalId: data.rentalId,
          },
        });
      });
    } catch (error) {
      this.logger.error(error, 'Failed to create transaction', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw error;
    }
  }
}
