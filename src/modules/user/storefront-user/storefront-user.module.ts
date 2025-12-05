import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module.js';
import { StorefrontUserController } from './storefront-user.controller.js';
import { StorefrontUserService } from './storefront-user.service.js';
import { StorefrontGuard } from '../../../common/guards/storefront.guard.js';

@Module({
  imports: [PrismaModule],
  controllers: [StorefrontUserController],
  providers: [StorefrontUserService, StorefrontGuard],
  exports: [StorefrontUserService],
})
export class StorefrontUserModule {}
