import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma.config';

class TransactionRepository {
  async getTransactions(
    tenantId: string,
    additionalWhere?: Prisma.TransactionsWhereInput,
  ) {
    return await prisma.transactions.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...additionalWhere,
      },
      include: this.getTransactionIncludeOptions(),
    });
  }

  private getTransactionIncludeOptions(): Prisma.TransactionsInclude {
    return {
      rental: {
        select: {
          rentalNumber: true,
        },
      },
      payment: {
        include: {
          customer: true,
          paymentMethod: true,
          paymentType: true,
          rental: {
            select: {
              id: true,
              rentalNumber: true,
            },
          },
        },
      },
      // user: {
      //   select: {
      //     firstName: true,
      //     lastName: true,
      //     username: true,
      //   },
      // },
    };
  }
}

export const transactionRepo = new TransactionRepository();
