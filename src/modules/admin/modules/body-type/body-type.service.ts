import { logger } from '../../../../config/logger';
import prisma from '../../../../config/prisma.config';
import { startCase, toLower } from 'lodash';
import { BodyTypeDto, BodyTypeSchema } from './body-type.dto';

class BodyTypeService {
  async validateBodyType(data: any) {
    if (!data) {
      throw new Error('No data provided');
    }

    const safeParse = BodyTypeSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Invalid body type data', {
        errors: safeParse.error.issues,
        data,
      });
      throw new Error('Validation failed');
    }

    return safeParse.data;
  }

  async getAllVehicleBodyTypes() {
    return await prisma.vehicleBodyType.findMany({
      include: {
        _count: {
          select: { models: true },
        },
      },
    });
  }

  async getVehicleBodyType(bodyType: string) {
    try {
      const formattedBodyType = startCase(toLower(bodyType));
      let existingBodyType;

      existingBodyType = await prisma.vehicleBodyType.findFirst({
        where: {
          bodyType: {
            equals: formattedBodyType,
            mode: 'insensitive',
          },
        },
      });

      if (!existingBodyType) {
        existingBodyType = await prisma.vehicleBodyType.create({
          data: { bodyType: formattedBodyType },
        });
      }

      return existingBodyType;
    } catch (error) {
      logger.e(
        `Error occurred while fetching vehicle body type (${bodyType}): ${error}`,
      );
      throw error;
    }
  }

  async createVehicleBodyType(data: BodyTypeDto) {
    try {
      const formattedBodyType = startCase(toLower(data.bodyType));

      const existingBodyType = await prisma.vehicleBodyType.findFirst({
        where: {
          bodyType: {
            equals: formattedBodyType,
            mode: 'insensitive',
          },
        },
      });

      if (existingBodyType) {
        logger.w(`Vehicle body type already exists: ${data.bodyType}`);
        return existingBodyType;
      }

      await prisma.vehicleBodyType.create({
        data: { bodyType: formattedBodyType },
      });
    } catch (error) {
      logger.e(
        `Error occurred while creating vehicle body type (${data.bodyType}): ${error}`,
      );
      throw error;
    }
  }

  async updateVehicleBodyType(data: BodyTypeDto) {
    try {
      const formattedBodyType = startCase(toLower(data.bodyType));

      const existingBodyType = await prisma.vehicleBodyType.findFirst({
        where: {
          id: data.id,
        },
      });

      if (!existingBodyType) {
        logger.w(`Vehicle body type not found: ${data.id}`);
        throw new Error('Vehicle body type not found');
      }

      const duplicateBodyType = await prisma.vehicleBodyType.findFirst({
        where: {
          bodyType: {
            equals: formattedBodyType,
            mode: 'insensitive',
          },
          id: { not: data.id },
        },
      });

      if (duplicateBodyType) {
        logger.w(`Duplicate vehicle body type: ${data.bodyType}`);
        throw new Error('Duplicate vehicle body type');
      }

      await prisma.vehicleBodyType.update({
        where: { id: data.id },
        data: { bodyType: formattedBodyType },
      });
    } catch (error) {
      logger.e(
        `Error occurred while updating vehicle body type (${data.bodyType}): ${error}`,
      );
      throw error;
    }
  }

  async deleteVehicleBodyType(id: string) {
    try {
      const existingBodyType = await prisma.vehicleBodyType.findUnique({
        where: { id },
        include: {
          models: {
            include: {
              _count: { select: { vehicles: true } },
            },
          },
        },
      });

      if (!existingBodyType) {
        logger.w(`Vehicle body type not found: ${id}`);
        throw new Error('Vehicle body type not found');
      }

      const totalVehicles = existingBodyType.models.reduce(
        (sum, model) => sum + model._count.vehicles,
        0,
      );

      if (totalVehicles > 0) {
        logger.w(
          `Vehicle body type cannot be deleted (ID: ${id}) - vehicles exist`,
        );
        throw new Error(
          'This vehicle body type is associated with existing vehicles and cannot be deleted',
        );
      }

      await prisma.vehicleBodyType.delete({
        where: { id },
      });
    } catch (error) {
      logger.e(
        `Error occurred while deleting vehicle body type (${id}): ${error}`,
      );
      throw error;
    }
  }

  async bulkCreateVehicleBodyTypes(bodyTypesData: BodyTypeDto[]) {
    try {
      for (const data of bodyTypesData) {
        if (!data.bodyType) {
          logger.w('Invalid body type data, skipping entry');
          continue;
        }

        await this.createVehicleBodyType(data);
      }
    } catch (error) {
      logger.e(`Error occurred during bulk creation of body types: ${error}`);
      throw error;
    }
  }
}

export const bodyTypeService = new BodyTypeService();
