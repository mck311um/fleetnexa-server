import { Body, Controller, Post } from '@nestjs/common';
import { StorefrontAuthService } from './storefront-auth.service.js';
import { StorefrontAuthDto } from './storefront-auth.dto.js';
import { EmailLoginDto } from '../dto/email-login.dto.js';

@Controller('auth/storefront')
export class StorefrontAuthController {
  constructor(private readonly service: StorefrontAuthService) {}

  @Post('login')
  async login(@Body() data: EmailLoginDto) {
    return this.service.loginUser(data);
  }

  @Post('register')
  async register(@Body() data: StorefrontAuthDto) {
    return this.service.createUser(data);
  }
}
