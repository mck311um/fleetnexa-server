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

  async deleteBookingTransaction(id: string, tx: TxClient) {
    try {
      const booking = await tx.rental.findUnique({
        where: { id },
      });
      if (!booking) {
        this.logger.error('Booking not found', 'Failed to delete booking');
        return;
      }
      await tx.transactions.updateMany({
        where: { rentalId: id },
        data: { isDeleted: true },
      });
      await tx.payment.updateMany({
        where: { rentalId: id },
        data: { isDeleted: true },
      });
      await tx.refund.updateMany({
        where: { rentalId: id },
        data: { isDeleted: true },
      });
    } catch (error) {
      this.logger.error(error, 'Failed to delete booking transaction', { id });
      throw error;
    }
  }
}
