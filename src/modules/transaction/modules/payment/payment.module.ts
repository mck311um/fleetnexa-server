import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller.js';
import { PaymentService } from './payment.service.js';
import { PrismaModule } from '../../../../prisma/prisma.module.js';
import { AuthGuard } from '../../../../common/guards/auth.guard.js';
import { TenantRepository } from '../../../../modules/tenant/tenant.repository.js';
import { TenantUserRepository } from '../../../../modules/user/tenant-user/tenant-user.repository.js';
import { TransactionModule } from '../../transaction.module.js';
import { TenantBookingRepository } from '../../../../modules/booking/tenant-booking/tenant-booking.repository.js';
import { DocumentModule } from '../../../../modules/document/document.module.js';

@Module({
  imports: [PrismaModule, TransactionModule, DocumentModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    AuthGuard,
    TenantRepository,
    TenantUserRepository,
    TenantBookingRepository,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
