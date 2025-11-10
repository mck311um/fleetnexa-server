"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bodyTypeService = void 0;
const logger_1 = require("../../../../config/logger");
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const lodash_1 = require("lodash");
const body_type_dto_1 = require("./body-type.dto");
class BodyTypeService {
    async validateBodyType(data) {
        if (!data) {
            throw new Error('No data provided');
        }
        const safeParse = body_type_dto_1.BodyTypeSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('Invalid body type data', {
                errors: safeParse.error.issues,
                data,
            });
            throw new Error('Validation failed');
        }
        return safeParse.data;
    }
    async getAllVehicleBodyTypes() {
        return await prisma_config_1.default.vehicleBodyType.findMany({
            include: {
                _count: {
                    select: { models: true },
                },
            },
        });
    }
    async getVehicleBodyType(bodyType) {
        try {
            const formattedBodyType = (0, lodash_1.startCase)((0, lodash_1.toLower)(bodyType));
            let existingBodyType;
            existingBodyType = await prisma_config_1.default.vehicleBodyType.findFirst({
                where: {
                    bodyType: {
                        equals: formattedBodyType,
                        mode: 'insensitive',
                    },
                },
            });
            if (!existingBodyType) {
                existingBodyType = await prisma_config_1.default.vehicleBodyType.create({
                    data: { bodyType: formattedBodyType },
                });
            }
            return existingBodyType;
        }
        catch (error) {
            logger_1.logger.e(`Error occurred while fetching vehicle body type (${bodyType}): ${error}`);
            throw error;
        }
    }
    async createVehicleBodyType(data) {
        try {
            const formattedBodyType = (0, lodash_1.startCase)((0, lodash_1.toLower)(data.bodyType));
            const existingBodyType = await prisma_config_1.default.vehicleBodyType.findFirst({
                where: {
                    bodyType: {
                        equals: formattedBodyType,
                        mode: 'insensitive',
                    },
                },
            });
            if (existingBodyType) {
                logger_1.logger.w(`Vehicle body type already exists: ${data.bodyType}`);
                return existingBodyType;
            }
            await prisma_config_1.default.vehicleBodyType.create({
                data: { bodyType: formattedBodyType },
            });
        }
        catch (error) {
            logger_1.logger.e(`Error occurred while creating vehicle body type (${data.bodyType}): ${error}`);
            throw error;
        }
    }
    async updateVehicleBodyType(data) {
        try {
            const formattedBodyType = (0, lodash_1.startCase)((0, lodash_1.toLower)(data.bodyType));
            const existingBodyType = await prisma_config_1.default.vehicleBodyType.findFirst({
                where: {
                    id: data.id,
                },
            });
            if (!existingBodyType) {
                logger_1.logger.w(`Vehicle body type not found: ${data.id}`);
                throw new Error('Vehicle body type not found');
            }
            const duplicateBodyType = await prisma_config_1.default.vehicleBodyType.findFirst({
                where: {
                    bodyType: {
                        equals: formattedBodyType,
                        mode: 'insensitive',
                    },
                    id: { not: data.id },
                },
            });
            if (duplicateBodyType) {
                logger_1.logger.w(`Duplicate vehicle body type: ${data.bodyType}`);
                throw new Error('Duplicate vehicle body type');
            }
            await prisma_config_1.default.vehicleBodyType.update({
                where: { id: data.id },
                data: { bodyType: formattedBodyType },
            });
        }
        catch (error) {
            logger_1.logger.e(`Error occurred while updating vehicle body type (${data.bodyType}): ${error}`);
            throw error;
        }
    }
    async deleteVehicleBodyType(id) {
        try {
            const existingBodyType = await prisma_config_1.default.vehicleBodyType.findUnique({
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
                logger_1.logger.w(`Vehicle body type not found: ${id}`);
                throw new Error('Vehicle body type not found');
            }
            const totalVehicles = existingBodyType.models.reduce((sum, model) => sum + model._count.vehicles, 0);
            if (totalVehicles > 0) {
                logger_1.logger.w(`Vehicle body type cannot be deleted (ID: ${id}) - vehicles exist`);
                throw new Error('This vehicle body type is associated with existing vehicles and cannot be deleted');
            }
            await prisma_config_1.default.vehicleBodyType.delete({
                where: { id },
            });
        }
        catch (error) {
            logger_1.logger.e(`Error occurred while deleting vehicle body type (${id}): ${error}`);
            throw error;
        }
    }
    async bulkCreateVehicleBodyTypes(bodyTypesData) {
        try {
            for (const data of bodyTypesData) {
                if (!data.bodyType) {
                    logger_1.logger.w('Invalid body type data, skipping entry');
                    continue;
                }
                await this.createVehicleBodyType(data);
            }
        }
        catch (error) {
            logger_1.logger.e(`Error occurred during bulk creation of body types: ${error}`);
            throw error;
        }
    }
}
exports.bodyTypeService = new BodyTypeService();
