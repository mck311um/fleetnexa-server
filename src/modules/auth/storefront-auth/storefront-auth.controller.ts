import { Body, Controller, Post } from '@nestjs/common';
import { StorefrontAuthService } from './storefront-auth.service.js';
import { StorefrontAuthDto } from './storefront-auth.dto.js';

@Controller('auth/storefront')
export class StorefrontAuthController {
  constructor(private readonly service: StorefrontAuthService) {}

  @Post('register')
  async register(@Body() data: StorefrontAuthDto) {
    return this.service.createUser(data);
  }
}
