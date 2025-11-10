"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleModelService = void 0;
const logger_1 = require("../../../../config/logger");
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const lodash_1 = require("lodash");
const vehicle_brand_service_1 = require("../vehicle-brand/vehicle-brand.service");
const body_type_service_1 = require("../body-type/body-type.service");
const vehicle_model_dto_1 = require("./vehicle-model.dto");
class VehicleModelService {
    async validateVehicleModel(data) {
        if (!data) {
            throw new Error('No data provided');
        }
        const safeParse = vehicle_model_dto_1.VehicleModelSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('Invalid vehicle model data', {
                errors: safeParse.error.issues,
                data,
            });
            throw new Error('Validation failed');
        }
        return safeParse.data;
    }
    async getAllVehicleModels() {
        return await prisma_config_1.default.vehicleModel.findMany({
            include: {
                bodyType: true,
                brand: true,
                _count: {
                    select: { vehicles: true },
                },
            },
        });
    }
    async createVehicleModel(data) {
        try {
            const formattedModel = (0, lodash_1.startCase)((0, lodash_1.toLower)(data.model));
            const existingBrand = await vehicle_brand_service_1.vehicleBrandService.getVehicleBrand(data.brand);
            const existingBodyType = await body_type_service_1.bodyTypeService.getVehicleBodyType(data.bodyType);
            const existingModel = await prisma_config_1.default.vehicleModel.findUnique({
                where: {
                    model_brandId_typeId: {
                        model: formattedModel,
                        brandId: existingBrand.id,
                        typeId: existingBodyType.id,
                    },
                },
            });
            if (existingModel) {
                logger_1.logger.w(`Vehicle model already exists: ${data.model} - ${existingBodyType.bodyType}`);
                return existingModel;
            }
            await prisma_config_1.default.vehicleModel.create({
                data: {
                    model: formattedModel,
                    brand: { connect: { id: existingBrand.id } },
                    bodyType: { connect: { id: existingBodyType.id } },
                },
            });
        }
        catch (error) {
            logger_1.logger.e(`Error occurred while creating vehicle model (${data.model}): ${error}`);
            throw error;
        }
    }
    async updateVehicleModel(data) {
        try {
            const formattedModel = (0, lodash_1.startCase)((0, lodash_1.toLower)(data.model));
            const existingBrand = await vehicle_brand_service_1.vehicleBrandService.getVehicleBrand(data.brand);
            const existingBodyType = await body_type_service_1.bodyTypeService.getVehicleBodyType(data.bodyType);
            const updatedModel = await prisma_config_1.default.vehicleModel.update({
                where: { id: data.id },
                data: {
                    model: formattedModel,
                    brand: { connect: { id: existingBrand.id } },
                    bodyType: { connect: { id: existingBodyType.id } },
                },
            });
            logger_1.logger.i(`Updated vehicle model: ${data.model} - ${data.bodyType}`);
            return updatedModel;
        }
        catch (error) {
            logger_1.logger.e(`Error occurred while updating vehicle model (${data.model}): ${error}`);
            throw error;
        }
    }
    async deleteVehicleModel(id) {
        try {
            const existingModel = await prisma_config_1.default.vehicleModel.findUnique({
                where: { id },
                include: {
                    _count: { select: { vehicles: true } },
                },
            });
            if (!existingModel) {
                logger_1.logger.w(`Vehicle model not found with ID: ${id}`);
                throw new Error('Vehicle model not found');
            }
            if (existingModel._count.vehicles > 0) {
                logger_1.logger.w(`Vehicle model cannot be deleted (ID: ${id}) - vehicles exist`);
                throw new Error('This vehicle model is associated with existing vehicles and cannot be deleted');
            }
            await prisma_config_1.default.vehicleModel.delete({
                where: { id },
            });
            logger_1.logger.i(`Deleted vehicle model with ID: ${id}`);
        }
        catch (error) {
            logger_1.logger.e(`Error occurred while deleting vehicle model (ID: ${id}): ${error}`);
            throw error;
        }
    }
    async bulkCreateVehicleModels(modelsData) {
        try {
            for (const data of modelsData) {
                if (!data.model || !data.brand || !data.bodyType) {
                    logger_1.logger.w(`Skipping invalid row: ${JSON.stringify(data)}`);
                    continue;
                }
                await this.createVehicleModel(data);
            }
        }
        catch (error) {
            logger_1.logger.e(`Error occurred while bulk creating vehicle models: ${error}`);
            throw error;
        }
    }
}
exports.vehicleModelService = new VehicleModelService();
