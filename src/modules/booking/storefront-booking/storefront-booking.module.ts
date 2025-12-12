import { Module } from '@nestjs/common';
import { StorefrontBookingController } from './storefront-booking.controller.js';
import { StorefrontBookingService } from './storefront-booking.service.js';
import { StorefrontCustomerModule } from '../../../modules/customer/storefront-customer/storefront-customer.module.js';
import { GeneratorModule } from '../../../common/generator/generator.module.js';
import { EmailModule } from '../../../common/email/email.module.js';
import { TenantNotificationModule } from '../../../modules/tenant/tenant-notification/tenant-notification.module.js';
import { WhatsappModule } from '../../../common/whatsapp/whatsapp.module.js';

@Module({
  imports: [
    StorefrontCustomerModule,
    GeneratorModule,
    EmailModule,
    TenantNotificationModule,
    WhatsappModule,
  ],
  controllers: [StorefrontBookingController],
  providers: [StorefrontBookingService],
  exports: [],
})
export class StorefrontBookingModule {}
