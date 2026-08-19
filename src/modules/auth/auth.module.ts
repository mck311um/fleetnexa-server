import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import jwtConfig from '../../config/jwt.config.js';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { TenantRepository } from '../tenant/tenant.repository.js';
import { UserRepository } from '../user/user.repository.js';
import { SessionService } from './services/session.service.js';
import refreshJwtConfig from '../../config/refresh-jwt.config.js';
import { RefreshStrategy } from './strategies/refresh.strategy.js';
import { OtpService } from './services/otp.service.js';
import { PasswordService } from './services/password.service.js';
import { AuthLogService } from './services/auth-log.service.js';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    PassportModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    JwtModule.registerAsync(refreshJwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    AuthLogService,
    OtpService,
    PasswordService,
    UserRepository,
    TenantRepository,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
  ],
  exports: [OtpService],
})
export class AuthModule {}
