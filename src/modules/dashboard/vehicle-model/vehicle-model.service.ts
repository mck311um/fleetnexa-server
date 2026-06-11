import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  CreateVehicleModelDto,
  UpdateVehicleModelDto,
} from './vehicle-model.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class VehicleModelService {
  private readonly logger = new Logger(VehicleModelService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAllVehicleModels() {
    try {
      return await this.prisma.vehicleModel.findMany({
        include: {
          brand: true,
          bodyType: true,
          _count: { select: { vehicles: true } },
        },
      });
    } catch (error: any) {
      this.logger.error('Error fetching vehicle models:', error);
      throw error;
    }
  }

  async createVehicleModel(data: CreateVehicleModelDto) {
    try {
      const existingModel = await this.prisma.vehicleModel.findFirst({
        where: {
          model: { equals: data.model, mode: 'insensitive' },
          brandId: data.brand,
          typeId: data.bodyType,
        },
      });

      if (existingModel) {
        this.logger.warn(
          `Attempt to create duplicate vehicle model: ${data.model} for brand ID: ${data.brand} and body type ID: ${data.bodyType}`,
        );
        throw new NotFoundException('Vehicle model already exists');
      }

      await this.prisma.vehicleModel.create({
        data: {
          model: data.model,
          brandId: data.brand,
          typeId: data.bodyType,
        },
      });

      const vehicleModels = await this.getAllVehicleModels();

      return {
        message: 'Vehicle model created successfully',
        vehicleModels,
      };
    } catch (error: any) {
      this.logger.error('Error creating vehicle model:', error);
      throw error;
    }
  }

  async updateVehicleModel(data: UpdateVehicleModelDto) {
    try {
      const existingModel = await this.prisma.vehicleModel.findUnique({
        where: { id: data.id },
      });

      if (!existingModel) {
        this.logger.warn(
          `Attempt to update non-existent vehicle model with ID: ${data.id}`,
        );
        throw new NotFoundException('Vehicle model not found');
      }

      const existingBrand = await this.prisma.vehicleBrand.findUnique({
        where: { id: data.brand },
      });

      if (!existingBrand) {
        this.logger.warn(
          `Attempt to update vehicle model with non-existent brand ID: ${data.brand}`,
        );
        throw new NotFoundException('Vehicle brand not found');
      }

      const existingBodyType = await this.prisma.vehicleBodyType.findUnique({
        where: { id: data.bodyType },
      });

      if (!existingBodyType) {
        this.logger.warn(
          `Attempt to update vehicle model with non-existent body type ID: ${data.bodyType}`,
        );
        throw new NotFoundException('Vehicle body type not found');
      }

      await this.prisma.vehicleModel.update({
        where: { id: data.id },
        data: {
          model: data.model,
          brandId: data.brand,
          typeId: data.bodyType,
        },
      });

      const vehicleModels = await this.getAllVehicleModels();

      return {
        message: 'Vehicle model updated successfully',
        vehicleModels,
      };
    } catch (error: any) {
      this.logger.error('Error updating vehicle model:', error);
      throw error;
    }
  }

  async bulkCreateVehicleModels(data: any[]) {
    try {
      const failedRows: { item: any; errors?: any; error?: string }[] = [];

      for (const item of data) {
        const instance: CreateVehicleModelDto = plainToInstance(
          CreateVehicleModelDto,
          item,
        );
        const errors = await validate(instance);

        if (errors.length > 0) {
          failedRows.push({ item, errors });
          this.logger.warn(
            `Validation failed for vehicle model: ${JSON.stringify(item)}`,
          );
          continue;
        }

        try {
          const existingBrand = await this.prisma.vehicleBrand.findFirst({
            where: {
              brand: { equals: item.brand, mode: 'insensitive' },
            },
          });

          if (!existingBrand) {
            this.logger.warn(
              `Brand "${item.brand}" not found for vehicle model: ${JSON.stringify(item)}`,
            );
            throw new NotFoundException(
              `Brand "${item.brand}" not found for vehicle model: ${item.model}`,
            );
          }

          const existingBodyType = await this.prisma.vehicleBodyType.findFirst({
            where: {
              bodyType: { equals: item.bodyType, mode: 'insensitive' },
            },
          });

          if (!existingBodyType) {
            this.logger.warn(
              `Body type "${item.bodyType}" not found for vehicle model: ${JSON.stringify(item)}`,
            );
            throw new NotFoundException(
              `Body type "${item.bodyType}" not found for vehicle model: ${item.model}`,
            );
          }

          console.log(
            `Creating vehicle model: ${item.model} with brand ID: ${existingBrand.id} and body type ID: ${existingBodyType.id}`,
          );

          await this.createVehicleModel({
            model: item.model,
            brand: existingBrand.id,
            bodyType: existingBodyType.id,
          });
        } catch (error: any) {
          failedRows.push({ item, error: error.message });
          this.logger.warn(
            `Skipping vehicle model due to error: ${JSON.stringify(item)} - Error: ${error.message}`,
          );
        }
      }

      const vehicleModels = await this.getAllVehicleModels();

      return {
        message: 'Bulk vehicle model upload completed',
        vehicleModels,
      };
    } catch (error: any) {
      this.logger.error('Error during bulk vehicle model upload', error);
      throw error;
    }
  }

  async deleteVehicleModel(id: string) {
    try {
      const existingModel = await this.prisma.vehicleModel.findUnique({
        where: { id },
        include: { _count: { select: { vehicles: true } } },
      });

      if (!existingModel) {
        this.logger.warn(
          `Attempt to delete non-existent vehicle model with ID: ${id}`,
        );
        throw new NotFoundException('Vehicle model not found');
      }

      if (existingModel._count.vehicles > 0) {
        this.logger.warn(
          `Attempt to delete vehicle model with ID: ${id} that is still in use by existing vehicles.`,
        );
        throw new NotFoundException(
          'Cannot delete vehicle model. It is still in use by existing vehicles.',
        );
      }

      await this.prisma.vehicleModel.delete({
        where: { id },
      });

      const vehicleModels = await this.getAllVehicleModels();

      return {
        message: 'Vehicle model deleted successfully',
        vehicleModels,
      };
    } catch (error: any) {
      this.logger.error('Error deleting vehicle model:', error);
      throw error;
    }
  }
}
