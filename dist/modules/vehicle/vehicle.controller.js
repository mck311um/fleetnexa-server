"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../config/logger");
const vehicle_service_1 = require("./vehicle.service");
const vehicle_dto_1 = require("./vehicle.dto");
const getAllTenantVehicles = async (req, res) => {
    const { tenant } = req.context;
    try {
        const vehicles = await vehicle_service_1.vehicleService.getTenantVehicles(tenant);
        return res.status(200).json(vehicles);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get vehicles', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res.status(500).json({ message: 'Failed to get vehicles' });
    }
};
const getVehicleById = async (req, res) => {
    const { tenant } = req.context;
    const { id } = req.params;
    try {
        const vehicle = await vehicle_service_1.vehicleService.getVehicleById(id, tenant);
        return res.status(200).json(vehicle);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get vehicle by ID', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            vehicleId: id,
        });
        return res.status(500).json({ message: 'Failed to get vehicle by ID' });
    }
};
const getVehicleByLicensePlate = async (req, res) => {
    const { tenant } = req.context;
    const { plate } = req.params;
    try {
        const vehicle = await vehicle_service_1.vehicleService.getVehicleByLicensePlate(plate, tenant);
        return res.status(200).json(vehicle);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get vehicle by license plate', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            plate,
        });
        return res
            .status(500)
            .json({ message: 'Failed to get vehicle by license plate' });
    }
};
const addVehicle = async (req, res) => {
    const { tenant, user } = req.context;
    const data = req.body;
    if (!data) {
        logger_1.logger.w('Vehicle data is missing');
        return res.status(400).json({ message: 'Vehicle data is required' });
    }
    try {
        const vehicleDto = vehicle_service_1.vehicleService.validateVehicleData(data);
        await vehicle_service_1.vehicleService.addVehicle(vehicleDto, tenant, user);
        const vehicles = await vehicle_service_1.vehicleService.getTenantVehicles(tenant);
        return res
            .status(201)
            .json({ message: 'Vehicle added successfully', vehicles });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to add vehicle', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res
            .status(500)
            .json({ message: error?.message || 'Failed to add vehicle' });
    }
};
const updateVehicle = async (req, res) => {
    const { tenant, user } = req.context;
    const data = req.body;
    if (!data) {
        return res.status(400).json({ message: 'Vehicle data is required' });
    }
    try {
        const vehicleDto = vehicle_service_1.vehicleService.validateVehicleData(data);
        await vehicle_service_1.vehicleService.updateVehicle(vehicleDto, tenant, user);
        const vehicles = await vehicle_service_1.vehicleService.getTenantVehicles(tenant);
        const vehicle = await vehicle_service_1.vehicleService.getVehicleById(vehicleDto.id, tenant);
        return res
            .status(200)
            .json({ message: 'Vehicle updated successfully', vehicle, vehicles });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update vehicle', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res
            .status(500)
            .json({ message: error?.message || 'Failed to update vehicle' });
    }
};
const deleteVehicle = async (req, res) => {
    const { tenant, user } = req.context;
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Vehicle ID is required' });
    }
    try {
        await vehicle_service_1.vehicleService.deleteVehicle(id, tenant, user);
        const vehicles = await vehicle_service_1.vehicleService.getTenantVehicles(tenant);
        return res
            .status(200)
            .json({ message: 'Vehicle deleted successfully', vehicles });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete vehicle', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            vehicleId: id,
        });
        return res.status(500).json({ message: 'Failed to delete vehicle' });
    }
};
const updateVehicleStatus = async (req, res) => {
    const { tenant, user } = req.context;
    const data = req.body;
    if (!data) {
        logger_1.logger.w('Status data is missing');
        return res.status(400).json({ message: 'Status data is required' });
    }
    const parseResult = vehicle_dto_1.UpdateVehicleStatusSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid status data',
            details: parseResult.error.issues,
        });
    }
    const statusDto = parseResult.data;
    try {
        await vehicle_service_1.vehicleService.updateVehicleStatus(statusDto, tenant, user);
        const vehicles = await vehicle_service_1.vehicleService.getTenantVehicles(tenant);
        return res
            .status(200)
            .json({ message: 'Vehicle status updated', vehicles });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update vehicle status', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            vehicleId: statusDto.vehicleId,
            status: statusDto.status,
        });
        return res.status(500).json({ message: 'Failed to update vehicle status' });
    }
};
const updateVehicleStorefrontStatus = async (req, res) => {
    const { tenant, user } = req.context;
    const { id } = req.params;
    if (!id) {
        logger_1.logger.w('Vehicle ID is missing');
        return res.status(400).json({ message: 'Vehicle ID is required' });
    }
    try {
        const message = await vehicle_service_1.vehicleService.updateVehicleStorefrontStatus(id, tenant, user);
        const vehicle = await vehicle_service_1.vehicleService.getVehicleById(id, tenant);
        const vehicles = await vehicle_service_1.vehicleService.getTenantVehicles(tenant);
        return res.status(200).json({
            message,
            vehicle,
            vehicles,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update vehicle storefront status', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            vehicleId: id,
        });
        return res.status(500).json({
            message: error.message || 'Failed to update vehicle storefront status',
        });
    }
};
exports.default = {
    getAllTenantVehicles,
    getVehicleById,
    getVehicleByLicensePlate,
    updateVehicleStatus,
    updateVehicleStorefrontStatus,
    addVehicle,
    updateVehicle,
    deleteVehicle,
};
