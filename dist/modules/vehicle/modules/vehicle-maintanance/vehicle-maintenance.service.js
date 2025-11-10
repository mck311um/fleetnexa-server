"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleMaintenanceService = void 0;
const logger_1 = require("../../../../config/logger");
const vehicle_maintenance_dto_1 = require("./vehicle-maintenance.dto");
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const expense_service_1 = require("../../../transaction/modules/expense/expense.service");
class VehicleMaintenanceService {
    async validateMaintenanceData(data) {
        const safeParse = vehicle_maintenance_dto_1.VehicleMaintenanceSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('Invalid vehicle maintenance data', {
                errors: safeParse.error.issues,
                data,
            });
            throw new Error('Invalid vehicle maintenance data');
        }
        return safeParse.data;
    }
    async getTenantMaintenanceServices(tenant) {
        try {
            const services = await prisma_config_1.default.vehicleMaintenance.findMany({
                where: { tenantId: tenant.id, isDeleted: false },
                include: {
                    services: true,
                    vendor: true,
                    vehicle: {
                        select: {
                            id: true,
                            brand: true,
                            model: true,
                            year: true,
                            licensePlate: true,
                        },
                    },
                },
            });
            return services;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching tenant maintenance services', {
                tenantId: tenant.id,
            });
            throw new Error('Could not fetch tenant maintenance services');
        }
    }
    async getVehicleMaintenances(vehicleId) {
        try {
            const maintenances = await prisma_config_1.default.vehicleMaintenance.findMany({
                where: { vehicleId, isDeleted: false },
                include: {
                    services: true,
                    vendor: true,
                    vehicle: {
                        select: {
                            id: true,
                            brand: true,
                            model: true,
                            year: true,
                            licensePlate: true,
                        },
                    },
                },
                orderBy: { startDate: 'desc' },
            });
            return maintenances;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching vehicle maintenances', { vehicleId });
            throw new Error('Could not fetch vehicle maintenances');
        }
    }
    async addVehicleMaintenance(data, tenant, user) {
        try {
            await prisma_config_1.default.vehicleMaintenance.create({
                data: {
                    id: data.id,
                    vehicleId: data.vehicleId,
                    vendorId: data.vendorId ?? null,
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                    cost: data.cost,
                    tenantId: tenant.id,
                    createdBy: user.username,
                    services: {
                        connect: data.services.map((serviceId) => ({ id: serviceId })),
                    },
                },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error adding vehicle maintenance', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Could not add vehicle maintenance');
        }
    }
    async updateVehicleMaintenance(data, tenant, user) {
        try {
            const existingRecord = await prisma_config_1.default.vehicleMaintenance.findUnique({
                where: { id: data.id },
            });
            if (!existingRecord) {
                throw new Error('Vehicle maintenance record not found');
            }
            await prisma_config_1.default.vehicleMaintenance.update({
                where: { id: data.id },
                data: {
                    vehicleId: data.vehicleId,
                    vendorId: data.vendorId || null,
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                    cost: data.cost,
                    updatedAt: new Date(),
                    updatedBy: user.username,
                    status: data.status || existingRecord.status,
                    tenantId: tenant.id,
                    services: {
                        set: data.services.map((id) => ({ id })),
                    },
                },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error updating vehicle maintenance', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Could not update vehicle maintenance');
        }
    }
    async deleteVehicleMaintenance(id, tenant, user) {
        try {
            const existingRecord = await prisma_config_1.default.vehicleMaintenance.findUnique({
                where: { id },
            });
            if (!existingRecord) {
                throw new Error('Vehicle maintenance record not found');
            }
            const deletedMaintenance = await prisma_config_1.default.vehicleMaintenance.update({
                where: { id },
                data: {
                    isDeleted: true,
                    updatedAt: new Date(),
                    updatedBy: user.username,
                },
            });
            return deletedMaintenance;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error deleting vehicle maintenance', {
                maintenanceId: id,
                teatId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Could not delete vehicle maintenance');
        }
    }
    async completeVehicleMaintenance(data, tenant, user) {
        try {
            const existingRecord = await prisma_config_1.default.vehicleMaintenance.findUnique({
                where: { id: data.id },
            });
            if (!existingRecord) {
                throw new Error('Vehicle maintenance record not found');
            }
            const updatedRecord = await prisma_config_1.default.vehicleMaintenance.update({
                where: { id: data.id },
                data: {
                    status: 'COMPLETED',
                    endDate: new Date(data.endDate),
                    cost: data.cost,
                    updatedAt: new Date(),
                    updatedBy: user.username,
                },
                include: {
                    services: true,
                    vehicle: {
                        include: { brand: true, model: true },
                    },
                    vendor: true,
                },
            });
            if (data.recordExpense) {
                const desc = `Maintenance ${updatedRecord.vehicle.year} ${updatedRecord.vehicle.brand.brand} ${updatedRecord.vehicle.model.model} (${updatedRecord.vehicle.licensePlate})`;
                const payee = updatedRecord.vendor
                    ? updatedRecord.vendor.vendor
                    : 'Unknown Vendor';
                const note = updatedRecord.services
                    .map((service) => service.service)
                    .join(', ');
                const expense = {
                    id: data.id,
                    vehicleId: data.vehicleId,
                    vendorId: data.vendorId,
                    amount: data.cost,
                    maintenanceId: data.id,
                    notes: note,
                    expenseDate: data.expenseDate
                        ? new Date(data.expenseDate).toISOString()
                        : new Date().toISOString(),
                    expense: desc,
                    payee,
                };
                await expense_service_1.expenseService.createExpense(expense, tenant, user);
            }
        }
        catch (error) {
            logger_1.logger.e(error, 'Error completing vehicle maintenance', {
                teatId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Could not complete vehicle maintenance');
        }
    }
}
exports.vehicleMaintenanceService = new VehicleMaintenanceService();
