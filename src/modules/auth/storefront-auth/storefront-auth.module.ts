import { Module } from '@nestjs/common';
import { StorefrontAuthController } from './storefront-auth.controller.js';
import { StorefrontAuthService } from './storefront-auth.service.js';
import { GeneratorModule } from '../../../common/generator/generator.module.js';
import { EmailModule } from '../../../common/email/email.module.js';

@Module({
  imports: [GeneratorModule, EmailModule],
  controllers: [StorefrontAuthController],
  providers: [StorefrontAuthService],
  exports: [StorefrontAuthService],
})
export class StorefrontAuthModule {}
