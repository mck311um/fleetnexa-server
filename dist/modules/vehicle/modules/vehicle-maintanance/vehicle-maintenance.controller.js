"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../../../config/logger");
const vehicle_maintenance_service_1 = require("./vehicle-maintenance.service");
const vehicle_repository_1 = require("../../vehicle.repository");
const getScheduledMaintenances = async (req, res) => {
    const { tenant } = req.context;
    try {
        const maintenances = await vehicle_maintenance_service_1.vehicleMaintenanceService.getTenantMaintenanceServices(tenant);
        return res.status(200).json(maintenances);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get scheduled maintenances', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res
            .status(500)
            .json({ message: 'Failed to get scheduled maintenances' });
    }
};
const getVehicleMaintenances = async (req, res) => {
    const { tenant } = req.context;
    const { id } = req.params;
    try {
        const maintenances = await vehicle_maintenance_service_1.vehicleMaintenanceService.getVehicleMaintenances(id);
        return res.status(200).json(maintenances);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get vehicle maintenances', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            vehicleId: id,
        });
        return res
            .status(500)
            .json({ message: 'Failed to get vehicle maintenances' });
    }
};
const addVehicleMaintenance = async (req, res) => {
    const data = req.body;
    const { tenant, user } = req.context;
    const maintenanceDto = await vehicle_maintenance_service_1.vehicleMaintenanceService.validateMaintenanceData(data);
    try {
        await vehicle_maintenance_service_1.vehicleMaintenanceService.addVehicleMaintenance(maintenanceDto, tenant, user);
        const scheduledMaintenances = await vehicle_maintenance_service_1.vehicleMaintenanceService.getTenantMaintenanceServices(tenant);
        const vehicle = await vehicle_repository_1.vehicleRepo.getVehicleById(data.vehicleId, tenant.id);
        const vehicles = await vehicle_repository_1.vehicleRepo.getVehicles(tenant.id);
        res.status(201).json({
            message: 'Vehicle maintenance added successfully',
            scheduledMaintenances,
            vehicle,
            vehicles,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to add vehicle maintenance', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        res.status(500).json({ error: 'Failed to add vehicle maintenance' });
    }
};
const updateVehicleMaintenance = async (req, res) => {
    const data = req.body;
    const { tenant, user } = req.context;
    const maintenanceDto = await vehicle_maintenance_service_1.vehicleMaintenanceService.validateMaintenanceData(data);
    try {
        await vehicle_maintenance_service_1.vehicleMaintenanceService.updateVehicleMaintenance(maintenanceDto, tenant, user);
        const vehicle = await vehicle_repository_1.vehicleRepo.getVehicleById(data.vehicleId, tenant.id);
        const vehicles = await vehicle_repository_1.vehicleRepo.getVehicles(tenant.id);
        const scheduledMaintenances = await vehicle_maintenance_service_1.vehicleMaintenanceService.getTenantMaintenanceServices(tenant);
        res.status(200).json({
            message: 'Vehicle maintenance updated successfully',
            vehicles,
            vehicle,
            scheduledMaintenances,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update vehicle maintenance', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        res.status(500).json({ error: 'Failed to update vehicle maintenance' });
    }
};
const deleteVehicleMaintenance = async (req, res) => {
    const { maintenanceId, vehicleId } = req.params;
    const { tenant, user } = req.context;
    if (!maintenanceId || !vehicleId) {
        logger_1.logger.w('No ID provided for deleting vehicle maintenance', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res.status(400).json({ message: 'No ID provided' });
    }
    try {
        await vehicle_maintenance_service_1.vehicleMaintenanceService.deleteVehicleMaintenance(maintenanceId, tenant, user);
        const vehicle = await vehicle_repository_1.vehicleRepo.getVehicleById(vehicleId, tenant.id);
        const vehicles = await vehicle_repository_1.vehicleRepo.getVehicles(tenant.id);
        const scheduledMaintenances = await vehicle_maintenance_service_1.vehicleMaintenanceService.getTenantMaintenanceServices(tenant);
        res.status(200).json({
            message: 'Vehicle maintenance deleted successfully',
            vehicles,
            vehicle,
            scheduledMaintenances,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete vehicle maintenance', {
            maintenanceId: maintenanceId,
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        res.status(500).json({ error: 'Failed to delete vehicle maintenance' });
    }
};
const completeVehicleMaintenance = async (req, res) => {
    const data = req.body;
    const { tenant, user } = req.context;
    const maintenanceDto = await vehicle_maintenance_service_1.vehicleMaintenanceService.validateMaintenanceData(data);
    try {
        await vehicle_maintenance_service_1.vehicleMaintenanceService.completeVehicleMaintenance(maintenanceDto, tenant, user);
        const vehicle = await vehicle_repository_1.vehicleRepo.getVehicleById(data.vehicleId, tenant.id);
        const vehicles = await vehicle_repository_1.vehicleRepo.getVehicles(tenant.id);
        const scheduledMaintenances = await vehicle_maintenance_service_1.vehicleMaintenanceService.getTenantMaintenanceServices(tenant);
        res.status(200).json({
            message: 'Vehicle maintenance completed successfully',
            vehicles,
            vehicle,
            scheduledMaintenances,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to complete vehicle maintenance', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        res.status(500).json({ error: 'Failed to complete vehicle maintenance' });
    }
};
exports.default = {
    getScheduledMaintenances,
    getVehicleMaintenances,
    addVehicleMaintenance,
    updateVehicleMaintenance,
    deleteVehicleMaintenance,
    completeVehicleMaintenance,
};
