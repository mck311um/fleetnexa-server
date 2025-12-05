import { Module } from '@nestjs/common';
import { TenantModule } from './modules/tenant/tenant.module.js';
import { TenantAuthModule } from './modules/auth/tenant/tenant-auth.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module.js';
import { TenantLocationModule } from './modules/tenant/tenant-location/tenant-location.module.js';
import { TenantRatesModule } from './modules/tenant/tenant-rates/tenant-rates.module.js';
import { TenantActivityModule } from './modules/tenant/tenant-activity/tenant-activity.module.js';
import { TenantExtrasModule } from './modules/tenant/tenant-extra/tenant-extra.module.js';
import { TenantNotificationModule } from './modules/tenant/tenant-notification/tenant-notification.module.js';
import { SocketModule } from './gateway/socket.module.js';
import { TenantReviewModule } from './modules/tenant/tenant-review/tenant-review.module.js';
import { TenantVendorModule } from './modules/tenant/tenant-vendor/tenant-vendor.module.js';
import { TenantViolationModule } from './modules/tenant/tenant-violation/tenant-violation.module.js';
import { BookingModule } from './modules/booking/booking.module.js';
import { StorefrontBookingModule } from './modules/booking/storefront-booking/storefront-booking.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TenantAuthModule,
    AuthModule,
    TenantLocationModule,
    TenantRatesModule,
    TenantActivityModule,
    TenantExtrasModule,
    TenantNotificationModule,
    TenantReviewModule,
    TenantVendorModule,
    TenantViolationModule,
    TenantModule,
    StorefrontBookingModule,
    BookingModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
