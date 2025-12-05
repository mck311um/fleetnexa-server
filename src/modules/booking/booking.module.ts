import { Module } from '@nestjs/common';
import { BookingService } from './booking.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { BookingRepository } from './booking.repository.js';
import { BookingController } from './booking.controller.js';
import { TenantRepository } from '../tenant/tenant.repository.js';
import { TenantUserRepository } from '../user/tenant/tenant-user.repository.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { StorefrontGuard } from '../../common/guards/storefront.guard.js';

@Module({
  imports: [PrismaModule],
  controllers: [BookingController],
  providers: [
    BookingService,
    BookingRepository,
    TenantRepository,
    TenantUserRepository,
    AuthGuard,
    StorefrontGuard,
  ],
  exports: [BookingService],
})
export class BookingModule {}
