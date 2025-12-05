import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module.js';
import { StorefrontCustomerService } from './storefront-customer.service.js';

@Module({
  imports: [PrismaModule],
  providers: [StorefrontCustomerService],
  exports: [StorefrontCustomerService],
})
export class StorefrontCustomerModule {}
