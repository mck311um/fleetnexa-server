import { Body, Controller, Get, Req, UseGuards } from '@nestjs/common';
import { StorefrontUserService } from './storefront-user.service.js';
import { StorefrontGuard } from '../../../common/guards/storefront.guard.js';
import type { AuthenticatedRequest } from '../../../types/authenticated-request.js';

@Controller('user/storefront')
export class StorefrontUserController {
  constructor(private readonly service: StorefrontUserService) {}

  @Get('me')
  @UseGuards(StorefrontGuard)
  async getCurrentStorefrontUser(@Req() req: AuthenticatedRequest) {
    const storefrontUserId = req.storefrontUser!.id;
    return this.service.getCurrentUser(storefrontUserId);
  }
}
