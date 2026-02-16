import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { TenantLoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TenantAuthService {
  private readonly logger = new Logger(TenantAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(data: TenantLoginDto) {
    try {
      let user: any | null = null;

      if (data.username.includes('@')) {
        user = await this.prisma.user.findUnique({
          where: { email: data.username },
          include: {
            tenant: true,
            role: {
              include: {
                rolePermission: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });
      } else {
        user = await this.prisma.user.findUnique({
          where: { username: data.username },
          include: {
            tenant: true,
            role: {
              include: {
                rolePermission: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });
      }

      if (!user) {
        this.logger.warn(`Login failed: User ${data.username} not found.`);
        throw new UnauthorizedException('Invalid username or password');
      }

      const passwordValid = await bcrypt.compare(data.password, user.password);
      if (!passwordValid) {
        this.logger.warn(
          `Login failed: Invalid password for user ${data.username}.`,
        );
        throw new UnauthorizedException('Invalid username or password');
      }

      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenant: user.tenant,
      };

      const payload = {
        user: {
          id: user.id,
          tenantId: user.tenantId,
          tenantCode: user.tenant?.tenantCode,
        },
      };

      const token = this.jwt.sign(payload, {
        expiresIn: data.rememberMe ? '30d' : '7d',
      });

      return { userData, token };
    } catch (error) {
      this.logger.error('Login error', error);
      throw error;
    }
  }
}
