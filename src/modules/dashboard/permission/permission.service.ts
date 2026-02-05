import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(private readonly prisma: PrismaService) {}

  create(data: CreatePermissionDto) {
    try {
      this.prisma.appPermission.create({
        data: {
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
        },
      });

      const permissions = this.findAll();

      return { message: 'Permission created successfully', permissions };
    } catch (error) {
      this.logger.error('Error creating permission:', error);
      throw error;
    }
  }

  findAll() {
    try {
      const permissions = this.prisma.appPermission.findMany({
        include: { category: true },
      });

      return permissions;
    } catch (error) {
      this.logger.error('Error fetching permissions:', error);
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  update(data: UpdatePermissionDto) {
    try {
      const existing = this.prisma.appPermission.findUnique({
        where: { id: data.id },
      });

      if (!existing) {
        throw new NotFoundException('Permission not found');
      }

      this.prisma.appPermission.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
        },
      });

      const permissions = this.findAll();

      return {
        message: 'Permission updated successfully',
        permissions,
      };
    } catch (error) {
      this.logger.error('Error updating permission:', error);
      throw error;
    }
  }

  remove(id: string) {
    try {
      const existing = this.prisma.appPermission.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Permission not found');
      }

      this.prisma.appPermission.delete({
        where: { id },
      });

      const permissions = this.findAll();

      return {
        message: 'Permission deleted successfully',
        permissions,
      };
    } catch (error) {
      this.logger.error('Error deleting permission:', error);
      throw error;
    }
  }
}
