import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GeneratorService } from '../../common/generator/generator.service.js';
import { Tenant } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { WelcomeEmailDto } from '../email/dto/welcome.dto.js';
import { EmailService } from '../email/email.service.js';
import { TenantUserService } from '../user/tenant/tenant-user.service.js';
import { UserRoleService } from '../user/user-role/user-role.service.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';
import { TenantExtraService } from './tenant-extras/tenant-extras.service.js';
import { TenantLocationService } from './tenant-location/tenant-location.service.js';
import { TenantRepository } from './tenant.repository.js';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: GeneratorService,
    private readonly locationService: TenantLocationService,
    private readonly userRoleService: UserRoleService,
    private readonly userService: TenantUserService,
    private readonly emailService: EmailService,
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

      if (user.email) {
        const emailData: WelcomeEmailDto = {
          username: user.username,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        };

        await this.emailService.sendWelcomeEmail(emailData, tenant);
      }

      return tenant;
    } catch (error) {
      this.logger.error('Failed to create tenant', error);
      throw error;
    }
  }
}
