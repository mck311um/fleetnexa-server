import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [TransactionService],
  controllers: [],
  exports: [TransactionService],
})
export class TransactionModule {}
