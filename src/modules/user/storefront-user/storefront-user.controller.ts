import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StorefrontUserService } from './storefront-user.service.js';
import { StorefrontGuard } from '../../../common/guards/storefront.guard.js';
import type { AuthenticatedRequest } from '../../../types/authenticated-request.js';
import { ApiGuard } from '../../../common/guards/api.guard.js';
import { StorefrontUserDto } from './storefront-user.dto.js';
import { ChangePasswordDto } from '../dto/change-password.dto.js';
import { DeleteUserDto } from '../dto/delete-user.dto.js';

@Controller('user/storefront')
@UseGuards(StorefrontGuard, ApiGuard)
export class StorefrontUserController {
  constructor(private readonly service: StorefrontUserService) {}

  @Get('me')
  async getCurrentStorefrontUser(@Req() req: AuthenticatedRequest) {
    const storefrontUserId = req.storefrontUser!.id;
    return this.service.getCurrentUser(storefrontUserId);
  }

  @Put()
  async updateStorefrontUser(
    @Req() req: AuthenticatedRequest,
    @Body() data: StorefrontUserDto,
  ) {
    const storefrontUserId = req.storefrontUser!.id;
    return this.service.updateUser(data, storefrontUserId);
  }

  @Patch('change-password')
  async changeStorefrontUserPassword(
    @Req() req: AuthenticatedRequest,
    @Body() data: ChangePasswordDto,
  ) {
    const storefrontUserId = req.storefrontUser!.id;
    return this.service.updatePassword(data, storefrontUserId);
  }

  @Delete()
  async deleteStorefrontUser(
    @Req() req: AuthenticatedRequest,
    @Body() data: DeleteUserDto,
  ) {
    const storefrontUserId = req.storefrontUser!.id;
    return this.service.deleteUser(data, storefrontUserId);
  }
}
