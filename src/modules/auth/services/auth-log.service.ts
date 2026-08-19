import { Injectable, Logger } from '@nestjs/common';
import { AuthAction, UserType } from '../../../generated/prisma/enums.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class AuthLogService {
  private readonly logger = new Logger(AuthLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logEvent(params: {
    userId: string;
    userType: UserType;
    action: AuthAction;
    meta?: any;
    ip?: string;
    userAgent?: string;
  }) {
    try {
      await this.prisma.authLog.create({
        data: {
          userId: params.userId,
          userType: params.userType,
          action: params.action,
          metaData: params.meta ? JSON.stringify(params.meta) : '{}',
          ipAddress: params.ip || '',
          userAgent: params.userAgent || '',
        },
      });
    } catch (error: any) {
      this.logger.error('Failed to write audit log', error);
      throw error;
    }
  }
}
