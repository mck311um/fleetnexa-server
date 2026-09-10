import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { InvoiceModule } from './invoice/invoice.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [InvoiceModule, ActivityModule],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [InvoiceModule, FinanceService],
})
export class FinanceModule {}
