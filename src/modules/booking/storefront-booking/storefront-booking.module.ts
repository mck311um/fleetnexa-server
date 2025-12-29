import { Module } from '@nestjs/common';
import { StorefrontBookingController } from './storefront-booking.controller.js';
import { StorefrontBookingService } from './storefront-booking.service.js';
import { StorefrontCustomerModule } from '../../../modules/customer/storefront-customer/storefront-customer.module.js';
import { TenantNotificationModule } from '../../../modules/tenant/tenant-notification/tenant-notification.module.js';

@Module({
  imports: [StorefrontCustomerModule, TenantNotificationModule],
  controllers: [StorefrontBookingController],
  providers: [StorefrontBookingService],
  exports: [],
})
export class StorefrontBookingModule {}
