import { Tenant } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { TxClient } from '../../config/prisma.config';
import generator from '../../services/generator.service';
import bcrypt from 'bcrypt';
import { logger } from '../../config/logger';
import { ChangePasswordDto } from './dto/change-password.dto';

const getCurrentUser = async (userId: string, tenant: Tenant, tx: TxClient) => {
  try {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
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
        profilePicture: true,
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
        tenant: {
          select: {
            tenantCode: true,
            tenantName: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const userData = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      initials: `${user.firstName[0]}${user.lastName[0]}`,
      fullName: `${user.firstName} ${user.lastName}`,
      tenantId: user.tenantId,
      tenant: user.tenant?.tenantCode,
      tenantName: user.tenant?.tenantName,
      createdAt: user.createdAt,
      theme: user.theme,
      color: user.color,
      email: user.email,
      profilePicture: user.profilePicture || null,
      roleId: user.roleId,
      requiredPasswordChange: user.requiredPasswordChange,
    };

    return userData;
  } catch (error) {
    logger.e(error, 'Error fetching current user', {
      userId,
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    throw new Error('Error fetching current user');
  }
};

const createUser = async (
  data: CreateUserDto,
  tenant: Tenant,
  tx: TxClient,
) => {
  try {
    const emailExists = await tx.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (emailExists) {
      throw new Error('Email already exists');
    }

    const username = await generator.generateUserName(
      data.firstName,
      data.lastName,
    );

    const salt = await bcrypt.genSalt(10);
    const password = await generator.generateTempPassword(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await tx.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        username,
        password: hashedPassword,
        tenantId: tenant.id,
        requiredPasswordChange: true,
        roleId: data.roleId,
      },
    });

    return { user, password };
  } catch (error) {
    logger.e(error, 'Error creating user', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    throw new Error('Error creating user');
  }
};

const deleteUser = async (id: string, tenant: Tenant, tx: TxClient) => {
  try {
    const user = await tx.user.findUnique({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await tx.user.update({
      where: {
        id,
        tenantId: tenant.id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  } catch (error) {
    logger.e(error, 'Error deleting user', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      userId: id,
    });
    throw new Error('Error deleting user');
  }
};

const changePassword = async (
  data: ChangePasswordDto,
  tenant: Tenant,
  tx: TxClient,
  userId: string,
) => {
  try {
    const user = await tx.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    await tx.user.update({
      where: {
        id: tenant.id,
      },
      data: {
        password: hashedPassword,
        requiredPasswordChange: false,
      },
    });
  } catch (error) {
    logger.e(error, 'Error changing password', {
      userId: tenant.id,
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
  }
};

const resetPassword = async (id: string, tenant: Tenant, tx: TxClient) => {
  try {
    const user = await tx.user.findUnique({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const salt = await bcrypt.genSalt(10);
    const password = await generator.generateTempPassword(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await tx.user.update({
      where: {
        id,
        tenantId: tenant.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return { updatedUser, password };
  } catch (error) {
    logger.e(error, 'Error resetting password', {
      userId: id,
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    throw new Error('Error resetting password');
  }
};

export default {
  createUser,
  deleteUser,
  getCurrentUser,
  changePassword,
  resetPassword,
};
