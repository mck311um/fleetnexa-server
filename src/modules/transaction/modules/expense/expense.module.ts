import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service.js';
import { TransactionModule } from '../../transaction.module.js';

@Module({
  imports: [TransactionModule],
  providers: [ExpenseService],
  controllers: [],
  exports: [ExpenseService],
})
export class ExpenseModule {}
