import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GeneratorService } from 'src/common/generator/generator.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantLocationService } from './tenant-location/tenant-location.service';
import { UserRoleService } from '../user/user-role/user-role.service';
import { TenantUserService } from '../user/tenant/tenant-user.service';
import { EmailService } from '../email/email.service';
import { WelcomeEmailDto } from '../email/dto/welcome.dto';

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
  ) {}

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
