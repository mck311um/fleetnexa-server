"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleBrandService = void 0;
const logger_1 = require("../../../../config/logger");
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const lodash_1 = require("lodash");
const vehicle_brand_dto_1 = require("./vehicle-brand.dto");
class VehicleBrandService {
    async validateVehicleBrand(data) {
        if (!data) {
            throw new Error('No data provided for vehicle brand');
        }
        const safeParse = vehicle_brand_dto_1.VehicleBrandSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('Invalid vehicle brand data', {
                errors: safeParse.error.issues,
                data,
            });
            throw new Error('Validation failed for vehicle brand');
        }
        return safeParse.data;
    }
    async getAllVehicleBrands() {
        return await prisma_config_1.default.vehicleBrand.findMany({
            include: {
                _count: {
                    select: { models: true },
                },
            },
        });
    }
    async getVehicleBrand(brand) {
        try {
            const formattedBrand = (0, lodash_1.startCase)((0, lodash_1.toLower)(brand));
            let existingBrand;
            existingBrand = await prisma_config_1.default.vehicleBrand.findFirst({
                where: {
                    brand: {
                        equals: formattedBrand,
                        mode: 'insensitive',
                    },
                },
            });
            if (!existingBrand) {
                existingBrand = await prisma_config_1.default.vehicleBrand.create({
                    data: { brand: formattedBrand },
                });
            }
            return existingBrand;
        }
        catch (error) {
            logger_1.logger.e(`Error occurred while fetching vehicle brand (${brand}): ${error}`);
            throw error;
        }
    }
    async createVehicleBrand(data) {
        try {
            const formattedBrand = (0, lodash_1.startCase)((0, lodash_1.toLower)(data.brand));
            const existingBrand = await prisma_config_1.default.vehicleBrand.findFirst({
                where: {
                    brand: {
                        equals: formattedBrand,
                        mode: 'insensitive',
                    },
                },
            });
            if (existingBrand) {
                logger_1.logger.w(`Vehicle brand already exists: ${formattedBrand}`);
                throw new Error('Vehicle brand already exists');
            }
            await prisma_config_1.default.vehicleBrand.create({
                data: { brand: formattedBrand },
            });
        }
        catch (error) {
            logger_1.logger.e(`Error occurred while creating vehicle brand: ${error}`);
            throw error;
        }
    }
    async updateVehicleBrand(data) {
        try {
            const formattedBrand = (0, lodash_1.startCase)((0, lodash_1.toLower)(data.brand));
            const existingBrand = await prisma_config_1.default.vehicleBrand.findFirst({
                where: {
                    brand: {
                        equals: formattedBrand,
                        mode: 'insensitive',
                    },
                },
            });
            if (!existingBrand) {
                logger_1.logger.w(`Vehicle brand not found: ${formattedBrand}`);
                throw new Error('Vehicle brand not found');
            }
            const duplicateBrand = await prisma_config_1.default.vehicleBrand.findFirst({
                where: {
                    brand: {
                        equals: formattedBrand,
                        mode: 'insensitive',
                    },
                    id: { not: existingBrand.id },
                },
            });
            if (duplicateBrand) {
                logger_1.logger.w(`Duplicate vehicle brand exists: ${formattedBrand}`);
                throw new Error('Another vehicle brand with the same name exists');
            }
            await prisma_config_1.default.vehicleBrand.update({
                where: { id: existingBrand.id },
                data: { brand: formattedBrand },
            });
        }
        catch (error) {
            logger_1.logger.e(`Error occurred while updating vehicle brand: ${error}`);
            throw error;
        }
    }
    async deleteVehicleBrand(id) {
        try {
            const existingBrand = await prisma_config_1.default.vehicleBrand.findUnique({
                where: { id },
            });
            if (!existingBrand) {
                logger_1.logger.w(`Vehicle brand not found (ID: ${id})`);
                throw new Error('Vehicle brand not found');
            }
            const associatedModelsCount = await prisma_config_1.default.vehicleModel.count({
                where: { brandId: id },
            });
            if (associatedModelsCount > 0) {
                logger_1.logger.w(`Vehicle brand cannot be deleted (ID: ${id}) - associated models exist`);
                throw new Error('This vehicle brand is associated with existing vehicle models and cannot be deleted');
            }
            await prisma_config_1.default.vehicleBrand.delete({
                where: { id },
            });
        }
        catch (error) {
            logger_1.logger.e(`Error occurred while deleting vehicle brand: ${error}`);
            throw error;
        }
    }
    async bulkCreateVehicleBrands(data) {
        try {
            for (const brandData of data) {
                const validatedBrand = await this.validateVehicleBrand(brandData);
                await this.createVehicleBrand(validatedBrand);
            }
        }
        catch (error) {
            logger_1.logger.e(`Error occurred while bulk creating vehicle brands: ${error}`);
            throw error;
        }
    }
}
exports.vehicleBrandService = new VehicleBrandService();
