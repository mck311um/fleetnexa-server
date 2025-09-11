import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma.config';

class UserRepository {
  getUsers = async (
    tenantId: string,
    additionalWhere?: Prisma.UserWhereInput,
  ) => {
    return await prisma.user.findMany({
      where: { tenantId, ...additionalWhere, isDeleted: false, show: true },
      select: this.getUserSelectOptions(),
    });
  };

  getUserById = async (id: string) => {
    return await prisma.user.findUnique({
      where: { id },
      select: this.getUserSelectOptions(),
    });
  };

  private getUserSelectOptions(): Prisma.UserSelect {
    return {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      tenantId: true,
      createdAt: true,
      email: true,
      theme: true,
      color: true,
      roleId: true,
      requiredPasswordChange: true,
      role: {
        include: {
          rolePermission: {
            include: {
              permission: true,
            },
          },
        },
      },
    };
  }
}

export const userRepo = new UserRepository();
