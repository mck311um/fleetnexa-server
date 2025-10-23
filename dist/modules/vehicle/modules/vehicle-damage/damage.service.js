"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleDamageService = void 0;
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const logger_1 = require("../../../../config/logger");
const damage_dto_1 = require("./damage.dto");
class VehicleDamageService {
    validateVehicleDamage(data) {
        if (!data) {
            throw new Error('No data provided');
        }
        const safeParse = damage_dto_1.VehicleDamageSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('Invalid vehicle damage data', {
                errors: safeParse.error.issues,
                data,
            });
            throw new Error('Invalid vehicle damage data');
        }
        return safeParse.data;
    }
    async getVehicleDamages(vehicleId, tenant) {
        try {
            const vehicle = await prisma_config_1.default.vehicle.findUnique({
                where: { id: vehicleId, tenantId: tenant.id },
            });
            if (!vehicle) {
                throw new Error('Vehicle not found');
            }
            const damages = await prisma_config_1.default.vehicleDamage.findMany({
                where: { vehicleId: vehicle.id, isDeleted: false },
                include: {
                    customer: true,
                },
            });
            return damages;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching vehicle damages', {
                vehicleId,
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Failed to get vehicle damages');
        }
    }
    async addVehicleDamage(data, tenant, user) {
        try {
            const vehicle = await prisma_config_1.default.vehicle.findUnique({
                where: { id: data.vehicleId, tenantId: tenant.id },
            });
            if (!vehicle) {
                throw new Error('Vehicle not found');
            }
            if (data.customerId) {
                const customer = await prisma_config_1.default.customer.findUnique({
                    where: { id: data.customerId, tenantId: tenant.id },
                });
                if (!customer) {
                    throw new Error('Customer not found');
                }
            }
            await prisma_config_1.default.vehicleDamage.create({
                data: {
                    id: data.id,
                    vehicleId: vehicle.id,
                    description: data.description,
                    images: data.images,
                    isRepaired: data.isRepaired,
                    partId: data.partId,
                    customerId: data.customerId || null,
                    location: data.location,
                    title: data.title,
                    severity: data.severity,
                    createdAt: new Date(),
                },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error adding vehicle damage', {
                data,
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Failed to add vehicle damage');
        }
    }
    async updateVehicleDamage(data, tenant, user) {
        try {
            const vehicle = await prisma_config_1.default.vehicle.findUnique({
                where: { id: data.vehicleId, tenantId: tenant.id },
            });
            if (!vehicle) {
                throw new Error('Vehicle not found');
            }
            if (data.customerId) {
                const customer = await prisma_config_1.default.customer.findUnique({
                    where: { id: data.customerId, tenantId: tenant.id },
                });
                if (!customer) {
                    throw new Error('Customer not found');
                }
            }
            const damage = await prisma_config_1.default.vehicleDamage.findUnique({
                where: { id: data.id, vehicleId: vehicle.id, isDeleted: false },
            });
            if (!damage) {
                throw new Error('Damage record not found');
            }
            await prisma_config_1.default.vehicleDamage.update({
                where: { id: damage.id },
                data: {
                    description: data.description,
                    images: data.images,
                    isRepaired: data.isRepaired,
                    partId: data.partId,
                    customerId: data.customerId || null,
                    title: data.title,
                    severity: data.severity,
                    updatedAt: new Date(),
                    updatedBy: user.username,
                },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error updating vehicle damage', {
                data,
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Failed to update vehicle damage');
        }
    }
    async deleteVehicleDamage(damageId, tenant, user) {
        try {
            const damage = await prisma_config_1.default.vehicleDamage.findUnique({
                where: { id: damageId, isDeleted: false },
                include: { vehicle: true },
            });
            if (!damage || damage.vehicle.tenantId !== tenant.id) {
                throw new Error('Damage record not found');
            }
            const updatedDamage = await prisma_config_1.default.vehicleDamage.update({
                where: { id: damage.id },
                data: {
                    isDeleted: true,
                    updatedAt: new Date(),
                    updatedBy: user.username,
                },
            });
            return updatedDamage;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error deleting vehicle damage', {
                damageId,
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Failed to delete vehicle damage');
        }
    }
}
exports.vehicleDamageService = new VehicleDamageService();
