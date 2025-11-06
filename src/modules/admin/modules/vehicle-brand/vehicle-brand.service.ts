import { logger } from '../../../../config/logger';
import prisma from '../../../../config/prisma.config';
import { startCase, toLower } from 'lodash';
import { VehicleBrandDto, VehicleBrandSchema } from './vehicle-brand.dto';

class VehicleBrandService {
  async validateVehicleBrand(data: any) {
    if (!data) {
      throw new Error('No data provided for vehicle brand');
    }

    const safeParse = VehicleBrandSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Invalid vehicle brand data', {
        errors: safeParse.error.issues,
        data,
      });
      throw new Error('Validation failed for vehicle brand');
    }

    return safeParse.data;
  }

  async getAllVehicleBrands() {
    return await prisma.vehicleBrand.findMany({
      include: {
        _count: {
          select: { models: true },
        },
      },
    });
  }

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

  async createVehicleBrand(data: VehicleBrandDto) {
    try {
      const formattedBrand = startCase(toLower(data.brand));

      const existingBrand = await prisma.vehicleBrand.findFirst({
        where: {
          brand: {
            equals: formattedBrand,
            mode: 'insensitive',
          },
        },
      });

      if (existingBrand) {
        logger.w(`Vehicle brand already exists: ${formattedBrand}`);
        throw new Error('Vehicle brand already exists');
      }

      await prisma.vehicleBrand.create({
        data: { brand: formattedBrand },
      });
    } catch (error) {
      logger.e(`Error occurred while creating vehicle brand: ${error}`);
      throw error;
    }
  }

  async updateVehicleBrand(data: VehicleBrandDto) {
    try {
      const formattedBrand = startCase(toLower(data.brand));

      const existingBrand = await prisma.vehicleBrand.findFirst({
        where: {
          brand: {
            equals: formattedBrand,
            mode: 'insensitive',
          },
        },
      });

      if (!existingBrand) {
        logger.w(`Vehicle brand not found: ${formattedBrand}`);
        throw new Error('Vehicle brand not found');
      }

      const duplicateBrand = await prisma.vehicleBrand.findFirst({
        where: {
          brand: {
            equals: formattedBrand,
            mode: 'insensitive',
          },
          id: { not: existingBrand.id },
        },
      });

      if (duplicateBrand) {
        logger.w(`Duplicate vehicle brand exists: ${formattedBrand}`);
        throw new Error('Another vehicle brand with the same name exists');
      }

      await prisma.vehicleBrand.update({
        where: { id: existingBrand.id },
        data: { brand: formattedBrand },
      });
    } catch (error) {
      logger.e(`Error occurred while updating vehicle brand: ${error}`);
      throw error;
    }
  }

  async deleteVehicleBrand(id: string) {
    try {
      const existingBrand = await prisma.vehicleBrand.findUnique({
        where: { id },
      });

      if (!existingBrand) {
        logger.w(`Vehicle brand not found (ID: ${id})`);
        throw new Error('Vehicle brand not found');
      }

      const associatedModelsCount = await prisma.vehicleModel.count({
        where: { brandId: id },
      });

      if (associatedModelsCount > 0) {
        logger.w(
          `Vehicle brand cannot be deleted (ID: ${id}) - associated models exist`,
        );
        throw new Error(
          'This vehicle brand is associated with existing vehicle models and cannot be deleted',
        );
      }

      await prisma.vehicleBrand.delete({
        where: { id },
      });
    } catch (error) {
      logger.e(`Error occurred while deleting vehicle brand: ${error}`);
      throw error;
    }
  }

  async bulkCreateVehicleBrands(data: VehicleBrandDto[]) {
    try {
      for (const brandData of data) {
        const validatedBrand = await this.validateVehicleBrand(brandData);

        await this.createVehicleBrand(validatedBrand);
      }
    } catch (error) {
      logger.e(`Error occurred while bulk creating vehicle brands: ${error}`);
      throw error;
    }
  }
}

export const vehicleBrandService = new VehicleBrandService();
