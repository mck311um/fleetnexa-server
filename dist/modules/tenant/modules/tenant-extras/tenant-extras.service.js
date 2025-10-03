"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantExtraService = void 0;
const logger_1 = require("../../../../config/logger");
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
class TenantExtraService {
    async getTenantExtras(tenantId) {
        try {
            const [tenantServices, tenantEquipments, tenantInsurances] = await Promise.all([
                prisma_config_1.default.tenantService.findMany({
                    where: { tenantId: tenantId, isDeleted: false },
                    include: { service: true },
                }),
                prisma_config_1.default.tenantEquipment.findMany({
                    where: { tenantId: tenantId, isDeleted: false },
                    include: { equipment: true },
                }),
                prisma_config_1.default.tenantInsurance.findMany({
                    where: { tenantId: tenantId, isDeleted: false },
                }),
            ]);
            const combined = [
                ...tenantServices.map((item) => ({
                    ...item,
                    type: 'service',
                    item: item.service.id,
                    name: item.service.service,
                    icon: item.service.icon,
                    description: item.service.description,
                })),
                ...tenantInsurances.map((item) => ({
                    ...item,
                    type: 'insurance',
                    item: item.insurance,
                    name: item.insurance,
                    icon: 'FaShieldAlt',
                    description: item.description,
                })),
                ...tenantEquipments.map((item) => ({
                    ...item,
                    type: 'equipment',
                    item: item.equipment.id,
                    name: item.equipment.equipment,
                    icon: item.equipment.icon,
                    description: item.equipment.description,
                })),
            ];
            return combined;
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to get tenant extras', {
                tenantId,
            });
            throw new Error('Failed to get tenant extras');
        }
    }
    async addTenantExtra(data, tenant, user) {
        try {
            if (data.type === 'service') {
                const existingService = await prisma_config_1.default.service.findFirst({
                    where: {
                        id: data.item,
                    },
                });
                if (!existingService) {
                    throw new Error('Service not found');
                }
                await prisma_config_1.default.tenantService.create({
                    data: {
                        id: data.id,
                        serviceId: data.item,
                        tenantId: tenant.id,
                        pricePolicy: data.pricePolicy,
                        price: data.price,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        updatedBy: user.username,
                    },
                });
            }
            else if (data.type === 'equipment') {
                const existingEquipment = await prisma_config_1.default.equipment.findFirst({
                    where: {
                        id: data.item,
                    },
                });
                if (!existingEquipment) {
                    throw new Error('Equipment not found');
                }
                await prisma_config_1.default.tenantEquipment.create({
                    data: {
                        id: data.id,
                        equipmentId: data.item,
                        tenantId: tenant.id,
                        pricePolicy: data.pricePolicy,
                        price: data.price,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        updatedBy: user.username,
                    },
                });
            }
            else if (data.type === 'insurance') {
                const existingInsurance = await prisma_config_1.default.tenantInsurance.findFirst({
                    where: {
                        id: data.id,
                        tenantId: tenant.id,
                        insurance: data.item,
                        isDeleted: false,
                    },
                });
                if (existingInsurance) {
                    throw new Error('Insurance already exists for this tenant');
                }
                await prisma_config_1.default.tenantInsurance.create({
                    data: {
                        insurance: data.item,
                        description: data.description || '',
                        tenantId: tenant.id,
                        pricePolicy: data.pricePolicy,
                        price: data.price,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        updatedBy: user.username,
                    },
                });
            }
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to add tenant extra', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                data,
            });
            throw new Error('Failed to add tenant extra');
        }
    }
    async updateTenantExtra(data, tenant, user) {
        try {
            if (data.type === 'service') {
                const existingService = await prisma_config_1.default.tenantService.findFirst({
                    where: {
                        id: data.id,
                        tenantId: tenant.id,
                        isDeleted: false,
                    },
                });
                if (!existingService) {
                    throw new Error('Tenant service not found');
                }
                await prisma_config_1.default.tenantService.update({
                    where: { id: data.id },
                    data: {
                        pricePolicy: data.pricePolicy,
                        price: data.price,
                        updatedAt: new Date(),
                        updatedBy: user.username,
                    },
                });
            }
            else if (data.type === 'equipment') {
                const existingEquipment = await prisma_config_1.default.tenantEquipment.findFirst({
                    where: {
                        id: data.id,
                        tenantId: tenant.id,
                        isDeleted: false,
                    },
                });
                if (!existingEquipment) {
                    throw new Error('Tenant equipment not found');
                }
                await prisma_config_1.default.tenantEquipment.update({
                    where: { id: data.id },
                    data: {
                        pricePolicy: data.pricePolicy,
                        price: data.price,
                        updatedAt: new Date(),
                        updatedBy: user.username,
                    },
                });
            }
            else if (data.type === 'insurance') {
                const existingInsurance = await prisma_config_1.default.tenantInsurance.findFirst({
                    where: {
                        id: data.id,
                        tenantId: tenant.id,
                        isDeleted: false,
                    },
                });
                if (!existingInsurance) {
                    throw new Error('Tenant insurance not found');
                }
                await prisma_config_1.default.tenantInsurance.update({
                    where: { id: data.id },
                    data: {
                        description: data.description || '',
                        pricePolicy: data.pricePolicy,
                        price: data.price,
                        updatedAt: new Date(),
                        updatedBy: user.username,
                    },
                });
            }
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to update tenant extra', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                data,
            });
            throw new Error('Failed to update tenant extra');
        }
    }
    async deleteService(id, tenant, user) {
        try {
            const existingService = await prisma_config_1.default.tenantService.findFirst({
                where: {
                    id: id,
                    tenantId: tenant.id,
                    isDeleted: false,
                },
            });
            if (!existingService) {
                throw new Error('Tenant service not found');
            }
            await prisma_config_1.default.tenantService.update({
                where: { id: id },
                data: {
                    isDeleted: true,
                    updatedAt: new Date(),
                    updatedBy: user.username,
                },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to delete tenant service', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                id,
            });
            throw new Error('Failed to delete tenant service');
        }
    }
    async deleteEquipment(id, tenant, user) {
        try {
            const existingEquipment = await prisma_config_1.default.tenantEquipment.findFirst({
                where: {
                    id: id,
                    tenantId: tenant.id,
                    isDeleted: false,
                },
            });
            if (!existingEquipment) {
                throw new Error('Tenant equipment not found');
            }
            await prisma_config_1.default.tenantEquipment.update({
                where: { id: id },
                data: {
                    isDeleted: true,
                    updatedAt: new Date(),
                    updatedBy: user.username,
                },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to delete tenant equipment', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                id,
            });
            throw new Error('Failed to delete tenant equipment');
        }
    }
    async deleteInsurance(id, tenant, user) {
        try {
            const existingInsurance = await prisma_config_1.default.tenantInsurance.findFirst({
                where: {
                    id: id,
                    tenantId: tenant.id,
                    isDeleted: false,
                },
            });
            if (!existingInsurance) {
                throw new Error('Tenant insurance not found');
            }
            await prisma_config_1.default.tenantInsurance.update({
                where: { id: id },
                data: {
                    isDeleted: true,
                    updatedAt: new Date(),
                    updatedBy: user.username,
                },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to delete tenant insurance', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                id,
            });
            throw new Error('Failed to delete tenant insurance');
        }
    }
}
exports.tenantExtraService = new TenantExtraService();
