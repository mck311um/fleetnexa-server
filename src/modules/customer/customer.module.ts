import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service.js';

@Module({
  imports: [],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
