import { Tenant } from '@prisma/client';
import { logger } from '../../../../config/logger';
import prisma from '../../../../config/prisma.config';
import { TenantViolationDto } from './tenant-violation.dto';

class TenantViolationsService {
  async getTenantViolations(tenant: Tenant) {
    try {
      const violations = await prisma.tenantViolation.findMany({
        where: { tenantId: tenant.id, isDeleted: false },
      });

      return violations;
    } catch (error) {
      logger.e(error, 'Error fetching tenant violations', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
    }
  }

  async createViolation(data: TenantViolationDto, tenant: Tenant) {
    try {
      const violations = await prisma.$transaction(async (tx) => {
        const existingViolation = await tx.tenantViolation.findFirst({
          where: { tenantId: tenant.id, violation: data.violation },
        });

        if (existingViolation) {
          throw new Error('Violation with this name already exists');
        }

        await tx.tenantViolation.create({
          data: {
            tenantId: tenant.id,
            violation: data.violation,
            description: data.description,
            amount: data.amount,
            createdAt: new Date(),
          },
        });

        return await tx.tenantViolation.findMany({
          where: { tenantId: tenant.id, isDeleted: false },
        });
      });

      return violations;
    } catch (error) {
      logger.e(error, 'Failed to create violation', {
        tenantId: tenant.id,
        violation: data.violation,
      });
    }
  }

  async updateViolation(data: TenantViolationDto, tenant: Tenant) {
    try {
      const violations = await prisma.$transaction(async (tx) => {
        logger.i(`Updating violation ${data.id} for tenant ${tenant.id}`);

        const existingViolation = await tx.tenantViolation.findUnique({
          where: {
            id: data.id,
          },
        });

        if (!existingViolation) {
          throw new Error('Violation not found');
        }

        await tx.tenantViolation.update({
          where: { id: data.id },
          data: {
            violation: data.violation,
            description: data.description,
            amount: data.amount,
            updatedAt: new Date(),
          },
        });

        return await tx.tenantViolation.findMany({
          where: { tenantId: tenant.id, isDeleted: false },
        });
      });

      return violations;
    } catch (error) {
      logger.e(error, 'Failed to update violation', {
        tenantId: tenant.id,
        violation: data.violation,
      });
      throw new Error('Failed to update violation');
    }
  }

  async deleteViolation(violationId: string, tenant: Tenant) {
    try {
      const violations = await prisma.$transaction(async (tx) => {
        const existingViolation = await tx.tenantViolation.findUnique({
          where: { id: violationId },
        });

        if (!existingViolation) {
          throw new Error('Violation not found');
        }

        await tx.tenantViolation.update({
          where: { id: violationId },
          data: { isDeleted: true, updatedAt: new Date() },
        });

        return await tx.tenantViolation.findMany({
          where: {
            tenantId: tenant.id,
            isDeleted: false,
            updatedAt: new Date(),
          },
        });
      });

      return violations;
    } catch (error) {
      logger.e(error, 'Failed to delete violation', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        violationId,
      });
      throw new Error('Failed to delete violation');
    }
  }
}

export const tenantViolationsService = new TenantViolationsService();
