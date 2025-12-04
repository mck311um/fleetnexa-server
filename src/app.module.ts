import { Module } from '@nestjs/common';
import { TenantModule } from './modules/tenant/tenant.module.js';
import { TenantAuthModule } from './modules/auth/tenant/tenant-auth.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [TenantModule, TenantAuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
