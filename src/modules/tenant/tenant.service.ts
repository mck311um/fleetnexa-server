import { logger } from '../../config/logger';
import prisma, { TxClient } from '../../config/prisma.config';
import { CreateTenantDto, CreateTenantSchema } from './dto/create-tenant.dto';
import { repo } from './tenant.repository';
import generator from '../../services/generator.service';
import { CreateUserDto } from '../user/user.dto';
import { Tenant, User } from '@prisma/client';
import {
  StorefrontSettingsDto,
  TenantViolationDto,
  UpdateTenantDto,
} from './dto/tenant.dto';
import { userService } from '../user/user.service';
import { tenantLocationService } from './modules/tenant-location/tenant-location.service';
import { authService } from '../auth/auth.service';

class TenantService {
  async validateCreateTenantData(data: any) {
    if (!data) {
      logger.w('No data provided for tenant creation');
      throw new Error('No data provided');
    }

    const safeParse = CreateTenantSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Invalid data provided for tenant creation', {
        errors: safeParse.error.issues,
      });
      throw new Error('Invalid data provided');
    }

    return safeParse.data;
  }

  async createTenant(data: CreateTenantDto) {
    try {
      const { tenant, country } = await prisma.$transaction(async (tx) => {
        const existingTenant = await repo.getTenantByEmail(data.companyEmail);

        if (existingTenant) {
          logger.w('Tenant with this email already exists', {
            email: data.companyEmail,
          });
          throw new Error(
            'Unable to create account. Please check your input and try again.',
          );
        }

        const country = await tx.country.findUnique({
          where: { code: data.country },
        });

        if (!country) {
          logger.w('Invalid country code provided for tenant creation', {
            countryCode: data.country,
          });
          throw new Error('Invalid country code provided');
        }

        const tenantCode = await generator.generateTenantCode(data.tenantName);
        const slug = await generator.generateTenantSlug(data.tenantName);

        const tenant = await tx.tenant.create({
          data: {
            tenantCode,
            tenantName: data.tenantName,
            slug,
            email: data.companyEmail,
            number: data.number,
            logo: 'https://fleetnexa.s3.us-east-1.amazonaws.com/Global+Images/placeholder_tenant.jpg',
            storefrontEnabled: false,
            createdAt: new Date(),
          },
        });

        await tx.address.create({
          data: {
            tenantId: tenant.id,
            countryId: country.id,
          },
        });

        return { tenant, country };
      });

      await tenantLocationService.initializeTenantLocations(country, tenant);
      const token = await authService.generateVerificationToken(tenant);

      const userDetails: CreateUserDto = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        roleId: '',
      };

      await userService.createOwner(userDetails, tenant);

      return { tenant, token };
    } catch (error) {
      logger.e(error, 'Failed to create tenant', {
        email: data.companyEmail,
        tenantName: data.tenantName,
      });
      throw error;
    }
  }

  async updateStorefrontSettings(
    data: StorefrontSettingsDto,
    tenant: Tenant,
    user: User,
  ) {
    try {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          storefrontEnabled: data.storefrontEnabled,
          description: data.description,
        },
      });

      if (!data.storefrontEnabled) {
        await prisma.vehicle.updateMany({
          where: { tenantId: tenant.id, storefrontEnabled: true },
          data: { storefrontEnabled: false },
        });
      }
    } catch (error) {
      logger.e(error, 'Failed to update storefront settings', {
        tenantCode: tenant.tenantCode,
        tenantId: tenant.id,
        userId: user.id,
        data,
      });
      throw new Error('Failed to update storefront settings');
    }
  }
}

export const tenantService = new TenantService();

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

const updateTenant = async (data: UpdateTenantDto, tenant: Tenant) => {
  try {
    await prisma.$transaction(async (tx) => {
      await prisma.address.upsert({
        where: { tenantId: tenant.id },
        update: {
          street: data.address.street,
          village: { connect: { id: data.address.villageId } },
          state: { connect: { id: data.address.stateId } },
          country: { connect: { id: data.address.countryId } },
        },
        create: {
          tenant: { connect: { id: tenant.id } },
          street: data.address.street,
          village: { connect: { id: data.address.villageId } },
          state: { connect: { id: data.address.stateId } },
          country: { connect: { id: data.address.countryId } },
        },
      });

      await tx.tenant.update({
        where: { id: tenant.id },
        data: {
          currencyId: data.currencyId,
          email: data.email,
          invoiceFootNotes: data.invoiceFootNotes,
          invoiceSequenceId: data.invoiceSequenceId,
          logo: data.logo,
          number: data.number,
          tenantName: data.tenantName,
          financialYearStart: data.financialYearStart,
          setupCompleted: true,
          securityDeposit: data.securityDeposit,
          additionalDriverFee: data.additionalDriverFee,
          daysInMonth: data.daysInMonth,
          paymentMethods: {
            set: data.paymentMethods.map((method: any) => ({ id: method })),
          },
          startTime: data.startTime,
          endTime: data.endTime,
        },
      });

      await tx.cancellationPolicy.upsert({
        where: {
          tenantId: tenant.id,
        },
        update: {
          amount: data.cancellationPolicy?.amount || 0,
          policy: data.cancellationPolicy?.policy || 'fixed_amount',
          minimumDays: data.cancellationPolicy?.minimumDays || 0,
          bookingMinimumDays: data.cancellationPolicy?.bookingMinimumDays || 0,
        },
        create: {
          tenantId: tenant.id,
          amount: data.cancellationPolicy?.amount || 0,
          policy: data.cancellationPolicy?.policy || 'fixed_amount',
          minimumDays: data.cancellationPolicy?.minimumDays || 0,
          bookingMinimumDays: data.cancellationPolicy?.bookingMinimumDays || 0,
        },
      });

      await tx.latePolicy.upsert({
        where: {
          tenantId: tenant.id,
        },
        update: {
          amount: data.latePolicy?.amount || 0,
          maxHours: data.latePolicy?.maxHours || 0,
        },
        create: {
          tenantId: tenant.id,
          amount: data.latePolicy?.amount || 0,
          maxHours: data.latePolicy?.maxHours || 0,
        },
      });

      const usdRate = await tx.tenantCurrencyRate.findFirst({
        where: { tenantId: tenant.id, currency: { code: 'USD' } },
      });

      const usd = await tx.currency.findUnique({
        where: { code: 'USD' },
      });

      if (!usd) {
        logger.i(`USD currency not found for tenant ${tenant.id}`);
        throw new Error('USD currency not found');
      }

      if (usdRate) {
        await tx.tenantCurrencyRate.update({
          where: { id: usdRate.id },
          data: {
            fromRate: data.fromUSDRate || 1.0,
            toRate: 1 / (data.fromUSDRate || 1.0),
          },
        });
      } else {
        await tx.tenantCurrencyRate.create({
          data: {
            tenantId: tenant.id,
            currencyId: usd.id,
            fromRate: data.fromUSDRate || 1.0,
            toRate: 1 / (data.fromUSDRate || 1.0),
          },
        });
      }
    });
  } catch (error) {
    logger.e(error, 'Failed to update tenant', {
      tenantId: tenant.id,
      data,
    });
    throw new Error('Failed to update tenant');
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
  getTenantById,
  createViolation,
  updateViolation,
  updateTenant,
};
