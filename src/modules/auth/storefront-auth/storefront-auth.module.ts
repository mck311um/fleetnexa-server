import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module.js';
import { StorefrontAuthController } from './storefront-auth.controller.js';
import { StorefrontAuthService } from './storefront-auth.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [StorefrontAuthController],
  providers: [StorefrontAuthService],
  exports: [StorefrontAuthService],
})
export class StorefrontAuthModule {}
