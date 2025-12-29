import { Injectable, Logger } from '@nestjs/common';
import type { PrismaService } from '../../../prisma/prisma.service.js';
import { AdminUserDto } from './admin-user.dto.js';

@Injectable()
export class AdminUserService {
  private readonly logger = new Logger(AdminUserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: AdminUserDto) {}
}
