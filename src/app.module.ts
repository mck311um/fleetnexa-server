import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantModule } from './modules/tenant/tenant.module';
import { TenantAuthModule } from './modules/auth/tenant/tenant-auth.module';

@Module({
  imports: [TenantModule, TenantAuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
