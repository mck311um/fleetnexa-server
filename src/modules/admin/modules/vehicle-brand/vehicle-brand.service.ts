import { logger } from '../../../../config/logger';
import prisma from '../../../../config/prisma.config';
import { startCase, toLower } from 'lodash';

class VehicleBrandService {
  async getVehicleBrand(brand: string) {
    try {
      const formattedBrand = startCase(toLower(brand));
      let existingBrand;

      existingBrand = await prisma.vehicleBrand.findFirst({
        where: {
          brand: {
            equals: formattedBrand,
            mode: 'insensitive',
          },
        },
      });

      if (!existingBrand) {
        existingBrand = await prisma.vehicleBrand.create({
          data: { brand: formattedBrand },
        });
      }

      return existingBrand;
    } catch (error) {
      logger.e(
        `Error occurred while fetching vehicle brand (${brand}): ${error}`,
      );
      throw error;
    }
  }
}

export const vehicleBrandService = new VehicleBrandService();
