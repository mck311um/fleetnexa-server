import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { Tenant } from 'prisma/generated/prisma/client';
import { GeneratorService } from 'src/common/generator/generator.service';
import bcrypt from 'bcrypt';

@Injectable()
export class TenantUserService {
  private readonly logger = new Logger(TenantUserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: GeneratorService,
  ) {}

  async createUser(data: CreateTenantUserDto, tenant: Tenant) {
    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const emailExists = await tx.user.findUnique({
          where: { email: data.email, tenantId: tenant.id },
        });

        if (emailExists) {
          this.logger.warn(
            `User creation failed: Email ${data.email} is already in use.`,
          );
          throw new ConflictException(
            'Email is already associated with another user.',
          );
        }

        const username = await this.generator.generateUsername(
          data.firstName,
          data.lastName,
        );

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const user = await tx.user.create({
          data: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            username,
            password: hashedPassword,
            tenantId: tenant.id,
            requirePasswordChange: true,
            roleId: data.roleId,
            createdAt: new Date(),
          },
        });

        return user;
      });

      return user;
    } catch (error) {
      this.logger.error('Failed to create tenant user', error);
      throw error;
    }
  }
}
