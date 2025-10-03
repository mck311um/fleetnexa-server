"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleRepo = void 0;
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
class VehicleRepository {
    async getVehicles(tenantId, additionalWhere) {
        return prisma_config_1.default.vehicle.findMany({
            where: {
                tenantId,
                isDeleted: false,
                ...additionalWhere,
            },
            include: this.getVehicleIncludeOptions(),
        });
    }
    async getAllVehicles() {
        return prisma_config_1.default.vehicle.findMany({
            where: {
                isDeleted: false,
            },
            include: this.getVehicleIncludeOptions(),
        });
    }
    async getVehicleById(id, tenantId) {
        return prisma_config_1.default.vehicle.findUnique({
            where: { id, tenantId, isDeleted: false },
            include: this.getVehicleIncludeOptions(),
        });
    }
    async getVehicleByLicensePlate(licensePlate, tenantId) {
        return prisma_config_1.default.vehicle.findUnique({
            where: { licensePlate, tenantId, isDeleted: false },
            include: this.getVehicleIncludeOptions(),
        });
    }
    async getVehicleByGroupId(groupId, tenantId, additionalWhere) {
        return prisma_config_1.default.vehicle.findMany({
            where: {
                tenantId,
                isDeleted: false,
                ...additionalWhere,
            },
            include: this.getVehicleIncludeOptions(),
        });
    }
    getVehicleIncludeOptions() {
        return {
            brand: true,
            model: {
                include: {
                    bodyType: true,
                },
            },
            vehicleStatus: true,
            transmission: true,
            wheelDrive: true,
            location: true,
            discounts: true,
            rentals: {
                where: { isDeleted: false },
                include: {
                    pickup: true,
                    return: true,
                    values: true,
                    drivers: {
                        include: {
                            customer: {
                                include: {
                                    license: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            username: true,
                        },
                    },
                },
            },
            fuelType: true,
            features: true,
            damages: {
                where: { isDeleted: false },
                include: {
                    customer: true,
                },
            },
            serviceLogs: {
                include: {
                    maintenanceService: true,
                    contact: true,
                    scheduledService: true,
                    damage: true,
                },
            },
            scheduledServices: {
                include: {
                    maintenanceService: true,
                },
            },
            _count: {
                select: {
                    rentals: {
                        where: { isDeleted: false },
                    },
                    damages: {
                        where: { isDeleted: false },
                    },
                    serviceLogs: true,
                },
            },
        };
    }
}
exports.vehicleRepo = new VehicleRepository();
