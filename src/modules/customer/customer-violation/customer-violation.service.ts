import { Tenant } from '@prisma/client';
import prisma from '../../../config/prisma.config';
import { logger } from '../../../config/logger';
import {
  CustomerViolationDto,
  CustomerViolationSchema,
} from './customer-violation.dto';

class CustomerViolationService {
  async validateCustomerViolationData(data: any) {
    if (!data) {
      logger.e(
        'Invalid customer violation data',
        'Customer violation validation failed',
      );
    }

    const safeParse = CustomerViolationSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Invalid customer violation data', {
        errors: safeParse.error.issues,
        input: data,
      });
      throw new Error('Invalid customer violation data');
    }

    return safeParse.data;
  }

  async getCustomerViolations(tenant: Tenant) {
    try {
      const violations = await prisma.customerViolation.findMany({
        where: { tenantId: tenant.id, isDeleted: false },
        include: {
          violation: true,
          customer: { select: { id: true, firstName: true, lastName: true } },
        },
      });
      return violations;
    } catch (error) {
      logger.e(error, 'Error fetching customer violations', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }

  async getCustomerViolationById(violationId: string, tenant: Tenant) {
    try {
      const violation = await prisma.customerViolation.findFirst({
        where: { id: violationId, tenantId: tenant.id, isDeleted: false },
        include: {
          violation: true,
          customer: { select: { id: true, firstName: true, lastName: true } },
        },
      });
      return violation;
    } catch (error) {
      logger.e(error, 'Error fetching customer violation by ID', {
        violationId,
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }

  async addCustomerViolation(data: CustomerViolationDto, tenant: Tenant) {
    try {
      const violations = await prisma.$transaction(async (tx) => {
        const customer = await tx.customer.findUnique({
          where: { id: data.customerId, tenantId: tenant.id },
        });

        if (!customer) {
          throw new Error('Customer not found');
        }

        await tx.customerViolation.create({
          data: {
            id: data.id,
            customerId: data.customerId,
            tenantId: tenant.id,
            violationId: data.violationId,
            violationDate: data.violationDate,
            notes: data.notes,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        return await tx.customerViolation.findMany({
          where: { tenantId: tenant.id, isDeleted: false },
          include: {
            violation: true,
            customer: { select: { id: true, firstName: true, lastName: true } },
          },
        });
      });

      return violations;
    } catch (error) {
      logger.e(error, 'Error adding customer violation', {
        data,
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }

  async updateCustomerViolation(data: CustomerViolationDto, tenant: Tenant) {
    try {
      const violations = await prisma.$transaction(async (tx) => {
        const customer = await tx.customer.findUnique({
          where: { id: data.customerId, tenantId: tenant.id },
        });

        if (!customer) {
          throw new Error('Customer not found');
        }

        const existingViolation = await tx.customerViolation.findUnique({
          where: { id: data.id, tenantId: tenant.id },
        });

        if (!existingViolation) {
          throw new Error('Customer violation not found');
        }

        await tx.customerViolation.update({
          where: { id: data.id, tenantId: tenant.id },
          data: {
            violationId: data.violationId,
            violationDate: data.violationDate,
            notes: data.notes,
            updatedAt: new Date(),
          },
        });

        return await tx.customerViolation.findMany({
          where: { tenantId: tenant.id, isDeleted: false },
          include: {
            violation: true,
            customer: { select: { id: true, firstName: true, lastName: true } },
          },
        });
      });

      return violations;
    } catch (error) {
      logger.e(error, 'Error updating customer violation', {
        data,
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }

  async deleteCustomerViolation(violationId: string, tenant: Tenant) {
    try {
      const violations = await prisma.$transaction(async (tx) => {
        const existingViolation = await tx.customerViolation.findUnique({
          where: { id: violationId, tenantId: tenant.id },
        });

        if (!existingViolation) {
          throw new Error('Customer violation not found');
        }

        await tx.customerViolation.update({
          where: { id: violationId, tenantId: tenant.id },
          data: { isDeleted: true, updatedAt: new Date() },
        });

        return await tx.customerViolation.findMany({
          where: { tenantId: tenant.id, isDeleted: false },
          include: {
            violation: true,
            customer: { select: { id: true, firstName: true, lastName: true } },
          },
        });
      });

      return violations;
    } catch (error) {
      logger.e(error, 'Error deleting customer violation', {
        violationId,
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }
}

export const customerViolationService = new CustomerViolationService();
