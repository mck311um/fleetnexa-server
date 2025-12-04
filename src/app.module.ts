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
    TenantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
