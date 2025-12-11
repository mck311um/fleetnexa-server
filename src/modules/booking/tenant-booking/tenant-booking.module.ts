import { Module } from '@nestjs/common';
import { TenantBookingController } from './tenant-booking.controller.js';
import { TenantBookingService } from './tenant-booking.service.js';
import { PrismaModule } from '../../../prisma/prisma.module.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';
import { TenantRepository } from '../../../modules/tenant/tenant.repository.js';
import { TenantUserRepository } from '../../../modules/user/tenant-user/tenant-user.repository.js';
import { TenantBookingRepository } from './tenant-booking.repository.js';
import { GeneratorModule } from '../../../common/generator/generator.module.js';
import { DocumentModule } from '../../../common/document/document.module.js';
import { EmailModule } from '../../../common/email/email.module.js';
import { VehicleModule } from '../../../modules/vehicle/vehicle.module.js';
import { CustomerModule } from '../../../modules/customer/customer.module.js';
import { TransactionModule } from '../../../modules/transaction/transaction.module.js';

@Module({
  imports: [
    PrismaModule,
    GeneratorModule,
    DocumentModule,
    EmailModule,
    VehicleModule,
    CustomerModule,
    TransactionModule,
  ],
  controllers: [TenantBookingController],
  providers: [
    TenantBookingService,
    AuthGuard,
    TenantRepository,
    TenantUserRepository,
    TenantBookingRepository,
  ],
  exports: [TenantBookingService],
})
export class TenantBookingModule {}
