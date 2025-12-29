import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../../user/user.module.js';
import { TenantAuthService } from './tenant-auth.service.js';
import { TenantAuthController } from './tenant-auth.controller.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TenantAuthService],
  controllers: [TenantAuthController],
  exports: [TenantAuthService],
})
export class TenantAuthModule {}
