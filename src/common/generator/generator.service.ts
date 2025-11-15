import { Injectable, Logger } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GeneratorService {
  private readonly logger = new Logger(GeneratorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateTenantCode(tenantName: string): Promise<string> {
    const initials = tenantName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('');

    const existingTenants = await this.prisma.tenant.findMany({
      where: {
        tenantCode: {
          startsWith: initials,
        },
      },
      select: {
        tenantCode: true,
      },
    });

    const seriesNumbers = existingTenants.map((t) => {
      const parts = t.tenantCode.split('-');
      return parts[1] ? parseInt(parts[1], 10) : 0;
    });

    const nextSeriesNumber =
      seriesNumbers.length > 0 ? Math.max(...seriesNumbers) + 1 : 1;

    return `${initials}-${nextSeriesNumber.toString().padStart(3, '0')}`;
  }

  async generateTenantSlug(tenantName: string): Promise<string> {
    let slug = '';
    slug = slugify(tenantName, { lower: true, strict: true });

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      const uniqueSuffix = Date.now();
      slug = `${slug}-${uniqueSuffix}`;
    }

    return slug;
  }

  async generateUsername(firstName: string, lastName: string): Promise<string> {
    try {
      const cleanFirst = firstName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const cleanLast = lastName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

      let attempt = 1;
      let username = '';

      while (true) {
        const prefix = cleanFirst.substring(0, attempt);
        username = `${prefix}${cleanLast}`;

        const existingUser = await this.prisma.user.findUnique({
          where: { username },
        });

        if (!existingUser) {
          return username;
        }

        attempt++;

        if (attempt > cleanFirst.length) {
          const randomNumber = Math.floor(1000 + Math.random() * 9000);
          username = `${cleanFirst[0]}${cleanLast}${randomNumber}`;
          return username;
        }
      }
    } catch (error) {
      this.logger.error('Failed to generate username', error);
      throw error;
    }
  }
}
