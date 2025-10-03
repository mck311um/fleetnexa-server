"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../../../config/logger");
const damage_service_1 = require("./damage.service");
const getVehicleDamages = async (req, res) => {
    const { tenant } = req.context;
    const { id } = req.params;
    try {
        const damages = await damage_service_1.vehicleDamageService.getVehicleDamages(id, tenant);
        return res.status(200).json(damages);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get vehicle damages', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            vehicleId: id,
        });
        return res.status(500).json({ message: 'Failed to get vehicle damages' });
    }
};
const addVehicleDamage = async (req, res) => {
    const { tenant, user } = req.context;
    const data = req.body;
    if (!data) {
        logger_1.logger.w('No data provided for adding vehicle damage', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res.status(400).json({ message: 'No data provided' });
    }
    const damageData = damage_service_1.vehicleDamageService.validateVehicleDamage(data);
    try {
        await damage_service_1.vehicleDamageService.addVehicleDamage(damageData, tenant, user);
        const damages = await damage_service_1.vehicleDamageService.getVehicleDamages(damageData.vehicleId, tenant);
        return res
            .status(201)
            .json({ message: 'Vehicle damage added successfully', damages });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to add vehicle damage', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res.status(500).json({ message: 'Failed to add vehicle damage' });
    }
};
const updateVehicleDamage = async (req, res) => {
    const { tenant, user } = req.context;
    const data = req.body;
    if (!data) {
        logger_1.logger.w('No data provided for updating vehicle damage', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res.status(400).json({ message: 'No data provided' });
    }
    const damageData = damage_service_1.vehicleDamageService.validateVehicleDamage(data);
    try {
        await damage_service_1.vehicleDamageService.updateVehicleDamage(damageData, tenant, user);
        const damages = await damage_service_1.vehicleDamageService.getVehicleDamages(damageData.vehicleId, tenant);
        return res
            .status(200)
            .json({ message: 'Vehicle damage updated successfully', damages });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update vehicle damage', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res.status(500).json({ message: 'Failed to update vehicle damage' });
    }
};
const deleteVehicleDamage = async (req, res) => {
    const { tenant, user } = req.context;
    const { id } = req.params;
    if (!id) {
        logger_1.logger.w('No ID provided for deleting vehicle damage', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res.status(400).json({ message: 'No ID provided' });
    }
    try {
        const damage = await damage_service_1.vehicleDamageService.deleteVehicleDamage(id, tenant, user);
        const damages = await damage_service_1.vehicleDamageService.getVehicleDamages(damage.vehicleId, tenant);
        return res
            .status(200)
            .json({ message: 'Vehicle damage deleted successfully', damages });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete vehicle damage', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            damageId: id,
        });
        return res.status(500).json({ message: 'Failed to delete vehicle damage' });
    }
};
exports.default = {
    getVehicleDamages,
    addVehicleDamage,
    updateVehicleDamage,
    deleteVehicleDamage,
};
