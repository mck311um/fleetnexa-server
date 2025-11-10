import { logger } from '../../../../config/logger';
import prisma from '../../../../config/prisma.config';
import { startCase, toLower } from 'lodash';
import { vehicleBrandService } from '../vehicle-brand/vehicle-brand.service';
import { bodyTypeService } from '../body-type/body-type.service';
import { VehicleModelDto, VehicleModelSchema } from './vehicle-model.dto';
import { VehicleDamageSchema } from '../../../vehicle/modules/vehicle-damage/damage.dto';

type VehicleModelRow = {
  model: string;
  brand: string;
  bodyType: string;
};

class VehicleModelService {
  async validateVehicleModel(data: any) {
    if (!data) {
      throw new Error('No data provided');
    }

    const safeParse = VehicleModelSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Invalid vehicle model data', {
        errors: safeParse.error.issues,
        data,
      });
      throw new Error('Validation failed');
    }

    return safeParse.data;
  }

  async getAllVehicleModels() {
    return await prisma.vehicleModel.findMany({
      include: {
        bodyType: true,
        brand: true,
        _count: {
          select: { vehicles: true },
        },
      },
    });
  }

  async createVehicleModel(data: VehicleModelDto) {
    try {
      const formattedModel = startCase(toLower(data.model));

      const existingBrand = await vehicleBrandService.getVehicleBrand(
        data.brand,
      );
      const existingBodyType = await bodyTypeService.getVehicleBodyType(
        data.bodyType,
      );

      const existingModel = await prisma.vehicleModel.findUnique({
        where: {
          model_brandId_typeId: {
            model: formattedModel,
            brandId: existingBrand.id,
            typeId: existingBodyType.id,
          },
        },
      });

      if (existingModel) {
        logger.w(
          `Vehicle model already exists: ${data.model} - ${existingBodyType.bodyType}`,
        );
        return existingModel;
      }

      await prisma.vehicleModel.create({
        data: {
          model: formattedModel,
          brand: { connect: { id: existingBrand.id } },
          bodyType: { connect: { id: existingBodyType.id } },
        },
      });
    } catch (error) {
      logger.e(
        `Error occurred while creating vehicle model (${data.model}): ${error}`,
      );
      throw error;
    }
  }

  async updateVehicleModel(data: VehicleModelDto) {
    try {
      const formattedModel = startCase(toLower(data.model));

      const existingBrand = await vehicleBrandService.getVehicleBrand(
        data.brand,
      );
      const existingBodyType = await bodyTypeService.getVehicleBodyType(
        data.bodyType,
      );

      const updatedModel = await prisma.vehicleModel.update({
        where: { id: data.id },
        data: {
          model: formattedModel,
          brand: { connect: { id: existingBrand.id } },
          bodyType: { connect: { id: existingBodyType.id } },
        },
      });

      logger.i(`Updated vehicle model: ${data.model} - ${data.bodyType}`);
      return updatedModel;
    } catch (error) {
      logger.e(
        `Error occurred while updating vehicle model (${data.model}): ${error}`,
      );
      throw error;
    }
  }

  async deleteVehicleModel(id: string) {
    try {
      const existingModel = await prisma.vehicleModel.findUnique({
        where: { id },
        include: {
          _count: { select: { vehicles: true } },
        },
      });

      if (!existingModel) {
        logger.w(`Vehicle model not found with ID: ${id}`);
        throw new Error('Vehicle model not found');
      }

      if (existingModel._count.vehicles > 0) {
        logger.w(
          `Vehicle model cannot be deleted (ID: ${id}) - vehicles exist`,
        );
        throw new Error(
          'This vehicle model is associated with existing vehicles and cannot be deleted',
        );
      }

      await prisma.vehicleModel.delete({
        where: { id },
      });

      logger.i(`Deleted vehicle model with ID: ${id}`);
    } catch (error) {
      logger.e(
        `Error occurred while deleting vehicle model (ID: ${id}): ${error}`,
      );
      throw error;
    }
  }

  async bulkCreateVehicleModels(modelsData: VehicleModelRow[]) {
    try {
      for (const data of modelsData) {
        if (!data.model || !data.brand || !data.bodyType) {
          logger.w(`Skipping invalid row: ${JSON.stringify(data)}`);
          continue;
        }

        await this.createVehicleModel(data);
      }
    } catch (error) {
      logger.e(`Error occurred while bulk creating vehicle models: ${error}`);
      throw error;
    }
  }
}

export const vehicleModelService = new VehicleModelService();
