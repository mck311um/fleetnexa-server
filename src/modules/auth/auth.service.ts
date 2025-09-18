import { logger } from '../../config/logger';
import prisma from '../../config/prisma.config';
import { LoginDto } from './auth.dto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class AuthService {
  async validateAdminUser(data: LoginDto) {
    const user = await prisma.adminUser.findUnique({
      where: { username: data.username },
    });
    if (!user) return null;

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) return null;

    const userData = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      initials: `${user.firstName[0]}${user.lastName[0]}`,
      fullName: `${user.firstName} ${user.lastName}`,
    };

    const payload = { adminUser: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: data.rememberMe ? '30d' : '7d',
    });

    return { userData, token };
  }

  async validateTenantUser(data: LoginDto) {
    try {
      const user = await prisma.user.findUnique({
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
      if (!user) return null;

      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) return null;

      const userData = {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        initials: `${user.firstName[0]}${user.lastName[0]}`,
        fullName: `${user.firstName} ${user.lastName}`,
        tenantId: user.tenantId,
        tenantCode: user.tenant?.tenantCode,
        roleId: user.roleId,
        requirePasswordChange: user.requirePasswordChange,
      };

      const payload = {
        user: {
          id: user.id,
          tenantId: user.tenantId,
          tenantCode: user.tenant?.tenantCode,
        },
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: data.rememberMe ? '30d' : '7d',
      });

      return { userData, token };
    } catch (error) {
      logger.e(error, 'Failed to validate tenant user', {
        username: data.username,
      });
      throw new Error('Failed to validate user');
    }
  }
}

export const authService = new AuthService();
