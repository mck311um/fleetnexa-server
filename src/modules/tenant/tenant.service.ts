import { logger } from '../../config/logger';
import prisma, { TxClient } from '../../config/prisma.config';
import { TenantExtra } from '../../types/tenant';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { repo } from './tenant.repository';
import generator from '../../services/generator.service';
import userService from '../user/user.service';
import { CreateUserDto } from '../user/user.dto';
import { CreateViolationDto } from './dto/tenant-create-dtos';
import { Tenant } from '@prisma/client';
import { TenantViolationDto } from './dto/tenant.dto';

const getTenantById = async (tenantId: string, tx: TxClient) => {
  try {
    return await repo.getTenantById(tenantId, tx);
  } catch (error) {
    logger.e(error, 'Failed to get tenant by ID', {
      tenantId,
    });
    throw new Error('Failed to get tenant by ID');
  }
};
const createTenant = async (data: CreateTenantDto, tx: TxClient) => {
  try {
    const existingTenant = await repo.getTenantByEmail(data.email, tx);

    if (existingTenant) {
      throw new Error('Tenant with this email already exists');
    }

    const tenantCode = await generator.generateTenantCode(data.tenantName);
    const slug = await generator.generateTenantSlug(data.tenantName);

    const tenant = await tx.tenant.create({
      data: {
        tenantCode,
        tenantName: data.tenantName,
        slug,
        email: data.email,
        number: data.number,
        logo: 'https://fleetnexa.s3.us-east-1.amazonaws.com/Global+Images/placeholder_tenant.jpg',
      },
    });

    const userDetails: CreateUserDto = {
      email: '',
      firstName: data.firstName,
      lastName: data.lastName,
      roleId: '',
    };

    const { user, password } = await userService.createOwner(
      userDetails,
      tenant,
      tx,
    );

    return { tenant, user, password };
  } catch (error) {
    logger.e(error, 'Failed to create tenant', {
      email: data.email,
      tenantName: data.tenantName,
    });
    throw new Error('Failed to create tenant');
  }
};

const getTenantExtras = async (tenantId: string, tx: TxClient) => {
  try {
    const [tenantServices, tenantEquipments, tenantInsurances] =
      await Promise.all([
        tx.tenantService.findMany({
          where: { tenantId: tenantId, isDeleted: false },
          include: { service: true },
        }),
        tx.tenantEquipment.findMany({
          where: { tenantId: tenantId, isDeleted: false },
          include: { equipment: true },
        }),
        tx.tenantInsurance.findMany({
          where: { tenantId: tenantId, isDeleted: false },
        }),
      ]);

    const combined: TenantExtra[] = [
      ...tenantServices.map((item) => ({
        ...item,
        type: 'Service' as const,
        name: item.service.service,
        icon: item.service.icon,
        description: item.service.description,
      })),
      ...tenantInsurances.map((item) => ({
        ...item,
        type: 'Insurance' as const,
        name: item.insurance,
        icon: 'FaShieldAlt',
        description: item.description,
      })),
      ...tenantEquipments.map((item) => ({
        ...item,
        type: 'Equipment' as const,
        name: item.equipment.equipment,
        icon: item.equipment.icon,
        description: item.equipment.description,
      })),
    ];

    return combined;
  } catch (error) {
    logger.e(error, 'Failed to get tenant extras', {
      tenantId,
    });
    throw new Error('Failed to get tenant extras');
  }
};

const createViolation = async (data: TenantViolationDto, tenant: Tenant) => {
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
          id: data.id,
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
};
const updateViolation = async (data: TenantViolationDto, tenant: Tenant) => {
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
};

export default {
  createTenant,
  getTenantById,
  getTenantExtras,
  createViolation,
  updateViolation,
};
