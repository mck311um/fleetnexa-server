import { Global, Module } from '@nestjs/common';
import { ResendService } from './resend.service.js';
import { CustomerModule } from '../../modules/customer/customer.module.js';

@Global()
@Module({
  imports: [CustomerModule],
  providers: [ResendService],
  exports: [ResendService],
})
export class ResendModule {}
