import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { TenantUserService } from './tenant-user.service.js';
import type { AuthenticatedRequest } from '../../../types/authenticated-request.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';
import { TenantUserDto } from './dto/tenant-user.dto.js';

@Controller('tenant/user')
@UseGuards(AuthGuard)
export class TenantUserController {
  private readonly logger = new Logger(TenantUserController.name);

  constructor(private readonly service: TenantUserService) {}

  @Get()
  async getTenantUsers(@Req() req: AuthenticatedRequest) {
    const { tenant } = req.context;
    return this.service.getTenantUsers(tenant);
  }

  @Get('me')
  async getCurrentUser(@Req() req: AuthenticatedRequest) {
    const { user, tenant } = req.context;
    return this.service.getCurrentUser(user.id, tenant);
  }

  @Post()
  async createUser(
    @Req() req: AuthenticatedRequest,
    @Body() data: TenantUserDto,
  ) {
    const { tenant } = req.context;

    return this.service.createUser(data, tenant);
  }

  @Put()
  async updateUser(
    @Req() req: AuthenticatedRequest,
    @Body() data: TenantUserDto,
  ) {
    const { tenant } = req.context;
    return this.service.updateUser(data, tenant);
  }

  @Delete(':id')
  async deleteUser(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const { tenant } = req.context;
    return this.service.deleteUser(id, tenant);
  }
}
