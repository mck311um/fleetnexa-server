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
import { AdminModule } from './modules/admin/admin.module.js';
import { VehicleModule } from './modules/vehicle/vehicle.module.js';
import { StorefrontAuthModule } from './modules/auth/storefront-auth/storefront-auth.module.js';
import { StorefrontUserModule } from './modules/user/storefront-user/storefront-user.module.js';
import { StorageModule } from './modules/storage/storage.module.js';
import { TenantUserModule } from './modules/user/tenant-user/tenant-user.module.js';
import { VehicleMaintenanceModule } from './modules/vehicle/modules/vehicle-maintenance/vehicle-maintenance.module.js';
import { TenantBookingModule } from './modules/booking/tenant-booking/tenant-booking.module.js';
import { TenantCustomerModule } from './modules/customer/tenant-customer/tenant-customer.module.js';
import { PaymentModule } from './modules/transaction/modules/payment/payment.module.js';
import { UserRoleModule } from './modules/user/tenant-user/modules/user-role/user-role.module.js';
import { RefundModule } from './modules/transaction/modules/refund/refund.module.js';
import { ExpenseModule } from './modules/transaction/modules/expense/expense.module.js';
import { TransactionModule } from './modules/transaction/transaction.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AdminModule,

    StorefrontAuthModule,
    StorefrontUserModule,
    AuthModule,
    TenantAuthModule,

    StorefrontBookingModule,
    TenantBookingModule,

    TenantCustomerModule,

    UserRoleModule,
    TenantUserModule,
    TenantLocationModule,
    TenantRatesModule,
    TenantActivityModule,
    TenantExtrasModule,
    TenantNotificationModule,
    TenantReviewModule,
    TenantVendorModule,
    TenantViolationModule,
    TenantModule,

    PaymentModule,
    RefundModule,
    ExpenseModule,
    TransactionModule,

    VehicleMaintenanceModule,
    VehicleModule,

    SocketModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
