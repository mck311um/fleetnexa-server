import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TenantLoginDto } from './dto/login.dto';
import { User } from 'prisma/generated/prisma/client';
import bcrypt from 'bcrypt';

@Injectable()
export class TenantAuthService {
  private readonly logger = new Logger(TenantAuthService.name);

  constructor(private readonly prisma: PrismaService) {}

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
    } catch (error) {}
  }
}
