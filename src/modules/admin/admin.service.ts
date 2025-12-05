import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStorefrontData() {
    try {
      const models = {
        vehicleFeatures: this.prisma.vehicleFeature,
        vehicleBodyTypes: this.prisma.vehicleBodyType,
        caribbeanCountries: this.prisma.caribbeanCountry,
        countries: this.prisma.country,
        states: this.prisma.state,
        villages: this.prisma.village,
        features: this.prisma.vehicleFeature,
      };

      const entries = await Promise.all(
        Object.entries(models).map(async ([key, model]) => {
          if (key === 'caribbeanCountries')
            return [
              key,
              await (model as any).findMany({
                include: { country: true },
              }),
            ];

          return [key, await (model as any).findMany()];
        }),
      );

      const data = Object.fromEntries(entries);

      return data;
    } catch (error) {
      this.logger.error('Failed to get storefront data', error);
      throw error;
    }
  }
}
