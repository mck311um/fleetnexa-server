import { Module } from '@nestjs/common';
import { StorefrontCustomerService } from './storefront-customer.service.js';

@Module({
  imports: [],
  providers: [StorefrontCustomerService],
  exports: [StorefrontCustomerService],
})
export class StorefrontCustomerModule {}
