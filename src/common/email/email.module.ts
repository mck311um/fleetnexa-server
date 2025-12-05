import { Module } from '@nestjs/common';
import { EmailService } from './email.service.js';
import { NotifyModule } from '../notify/notify.module.js';
import { FormatterModule } from '../formatter/formatter.module.js';
import { CustomerModule } from '../../modules/customer/customer.module.js';

@Module({
  imports: [NotifyModule, FormatterModule, CustomerModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
