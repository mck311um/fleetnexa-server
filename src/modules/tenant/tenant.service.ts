import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GeneratorService } from '../../common/generator/generator.service.js';
import { Tenant, User } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TenantUserService } from '../user/tenant/tenant-user.service.js';
import { UserRoleService } from '../user/user-role/user-role.service.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';
import { TenantExtraService } from './tenant-extra/tenant-extra.service.js';
import { TenantLocationService } from './tenant-location/tenant-location.service.js';
import { TenantRepository } from './tenant.repository.js';
import { UpdateTenantDto } from './dto/update-tenant.dto.js';
import { UpdateStorefrontDto } from './dto/update-storefont.dto.js';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: GeneratorService,
    private readonly locationService: TenantLocationService,
    private readonly userRoleService: UserRoleService,
    private readonly userService: TenantUserService,
    private readonly extraService: TenantExtraService,
    private readonly tenantRepo: TenantRepository,
  ) {}

  async getCurrentTenant(tenant: Tenant) {
    try {
      const extras = await this.extraService.getTenantExtras(tenant);

      const data = {
        tenant,
        extras,
      };
      return data;
    } catch (error) {
      this.logger.error('Failed to get current tenant', error);
      throw error;
    }
  }

  async getTenantById(tenantId: string) {
    try {
      const tenant = await this.tenantRepo.getTenantById(tenantId);

      if (!tenant) {
        this.logger.warn(`Tenant with ID ${tenantId} not found.`);
        throw new NotFoundException('Tenant not found');
      }

      return tenant;
    } catch (error) {
      this.logger.error('Failed to get tenant by ID', error);
      throw error;
    }
  }

  async getStorefrontTenants() {
    try {
      return await this.tenantRepo.getStorefrontTenants();
    } catch (error) {
      this.logger.error('Failed to get storefront tenants', error);
      throw error;
    }
  }

  async createTenant(data: CreateTenantDto) {
    try {
      const { tenant, country } = await this.prisma.$transaction(async (tx) => {
        const existingTenant = await tx.tenant.findUnique({
          where: { email: data.companyEmail },
        });

        if (existingTenant) {
          this.logger.warn(
            `Tenant creation failed: Tenant ${existingTenant.tenantName} with email ${data.companyEmail} already exists.`,
          );
          throw new ConflictException(
            'This email is already associated with another Rental Car Company.',
          );
        }

        const country = await tx.country.findUnique({
          where: { code: data.country },
        });
        if (!country) {
          this.logger.warn(
            `Tenant creation failed: Country with code ${data.country} not found.`,
          );
          throw new NotFoundException('Invalid country code provided.');
        }

        const code = await this.generator.generateTenantCode(data.tenantName);
        const slug = await this.generator.generateTenantSlug(data.tenantName);

        const tenant = await tx.tenant.create({
          data: {
            tenantCode: code,
            tenantName: data.tenantName,
            slug,
            email: data.companyEmail,
            number: data.phoneNumber,
            logo: 'https://fleetnexa.s3.us-east-1.amazonaws.com/Global+Images/placeholder_tenant.jpg',
            storefrontEnabled: false,
            createdAt: new Date(),
          },
        });

        tx.address.create({
          data: {
            tenantId: tenant.id,
            countryId: country.id,
          },
        });

        return { tenant, country };
      });

      this.logger.log(data.user);

      await this.locationService.initializeTenantLocation(country, tenant);
      const role = await this.userRoleService.createDefaultRole(tenant);

      data.user.roleId = role.id;
      const user = await this.userService.createUser(data.user, tenant);

      // if (user.email) {
      //   const emailData: WelcomeEmailDto = {
      //     username: user.username,
      //     name: `${user.firstName} ${user.lastName}`,
      //     email: user.email,
      //   };

      //   await this.emailService.sendWelcomeEmail(emailData, tenant);
      // }

      return tenant;
    } catch (error) {
      this.logger.error('Failed to create tenant', error);
      throw error;
    }
  }

  async updateTenant(data: UpdateTenantDto, tenant: Tenant) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.address.upsert({
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
              set: data.paymentMethods.map((method: any) => ({
                id: method,
              })),
            },
            startTime: data.startTime,
            endTime: data.endTime,
          },
        });

        const cancellationPolicy = await tx.cancellationPolicy.upsert({
          where: {
            tenantId: tenant.id,
          },
          update: {
            amount: data.cancellationPolicy?.amount || 0,
            policy: data.cancellationPolicy?.policy || 'fixed_amount',
            minimumDays: data.cancellationPolicy?.minimumDays || 0,
            bookingMinimumDays:
              data.cancellationPolicy?.bookingMinimumDays || 0,
          },
          create: {
            tenantId: tenant.id,
            amount: data.cancellationPolicy?.amount || 0,
            policy: data.cancellationPolicy?.policy || 'fixed_amount',
            minimumDays: data.cancellationPolicy?.minimumDays || 0,
            bookingMinimumDays:
              data.cancellationPolicy?.bookingMinimumDays || 0,
          },
        });

        const latePolicy = await tx.latePolicy.upsert({
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

        await tx.tenant.update({
          where: { id: tenant.id },
          data: {
            cancellationPolicyId: cancellationPolicy.id,
            latePolicyId: latePolicy.id,
          },
        });

        const usdRate = await tx.tenantCurrencyRate.findFirst({
          where: { tenantId: tenant.id, currency: { code: 'USD' } },
        });

        const usd = await tx.currency.findUnique({
          where: { code: 'USD' },
        });

        if (!usd) {
          this.logger.warn(`USD currency not found for tenant ${tenant.id}`);
          throw new NotFoundException('USD currency not found');
        }

        if (usdRate) {
          await tx.tenantCurrencyRate.update({
            where: { id: usdRate.id },
            data: {
              toRate: data.fromUSDRate || 1.0,
              fromRate: 1 / (data.fromUSDRate || 1.0),
            },
          });
        } else {
          await tx.tenantCurrencyRate.create({
            data: {
              tenantId: tenant.id,
              currencyId: usd.id,
              toRate: data.fromUSDRate || 1.0,
              fromRate: 1 / (data.fromUSDRate || 1.0),
            },
          });
        }
      });
    } catch (error) {
      this.logger.error('Failed to update tenant', error);
      throw error;
    }
  }

  async updateStorefront(data: UpdateStorefrontDto, tenant: Tenant) {
    try {
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          storefrontEnabled: data.storefrontEnabled,
          description: data.description,
        },
      });

      if (!data.storefrontEnabled) {
        await this.prisma.vehicle.updateMany({
          where: { tenantId: tenant.id, storefrontEnabled: true },
          data: { storefrontEnabled: false },
        });
      }
    } catch (error) {
      this.logger.error('Failed to update storefront settings', error);
      throw error;
    }
  }
}
