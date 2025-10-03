"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_extras_service_1 = require("./tenant-extras.service");
const logger_1 = require("../../../../config/logger");
const tenant_extras_dto_1 = require("./tenant-extras.dto");
const getTenantExtras = async (req, res) => {
    const { tenant, user } = req.context;
    try {
        const extras = await tenant_extras_service_1.tenantExtraService.getTenantExtras(tenant.id);
        return res.status(200).json(extras);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get tenant extras', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            userId: user.id,
        });
        return res.status(500).json({ message: 'Failed to get tenant extras' });
    }
};
const addTenantExtra = async (req, res) => {
    const { data } = req.body;
    const { tenant, user } = req.context;
    if (!data) {
        logger_1.logger.w('Tenant extra data is missing');
        return res.status(400).json({ message: 'Tenant extra data is required' });
    }
    const parseResult = tenant_extras_dto_1.TenantExtraSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid user data',
            details: parseResult.error.issues,
        });
    }
    const extraData = parseResult.data;
    try {
        await tenant_extras_service_1.tenantExtraService.addTenantExtra(extraData, tenant, user);
        const extras = await tenant_extras_service_1.tenantExtraService.getTenantExtras(tenant.id);
        return res.status(200).json({
            message: 'Extra added successfully',
            extras,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to add tenant extra', {
            tenantId: tenant.id,
            userId: user.id,
            data: extraData,
        });
        return res.status(500).json({ message: 'Failed to add tenant extra' });
    }
};
const updateTenantExtra = async (req, res) => {
    const { data } = req.body;
    const { tenant, user } = req.context;
    if (!data) {
        logger_1.logger.w('Tenant extra data is missing');
        return res.status(400).json({ message: 'Tenant extra data is required' });
    }
    const parseResult = tenant_extras_dto_1.TenantExtraSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid user data',
            details: parseResult.error.issues,
        });
    }
    const extraData = parseResult.data;
    try {
        await tenant_extras_service_1.tenantExtraService.updateTenantExtra(extraData, tenant, user);
        const extras = await tenant_extras_service_1.tenantExtraService.getTenantExtras(tenant.id);
        return res.status(200).json({
            message: 'Extra updated successfully',
            extras,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update tenant extra', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            data,
        });
        return res.status(500).json({ message: 'Failed to update tenant extra' });
    }
};
const deleteTenantService = async (req, res) => {
    const { id } = req.params;
    const { tenant, user } = req.context;
    try {
        await tenant_extras_service_1.tenantExtraService.deleteService(id, tenant, user);
        const extras = await tenant_extras_service_1.tenantExtraService.getTenantExtras(tenant.id);
        return res.status(200).json({
            message: 'Extra deleted successfully',
            extras,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete tenant service', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            userId: user.id,
        });
        return res.status(500).json({ message: 'Failed to delete tenant service' });
    }
};
const deleteTenantEquipment = async (req, res) => {
    const { id } = req.params;
    const { tenant, user } = req.context;
    try {
        await tenant_extras_service_1.tenantExtraService.deleteEquipment(id, tenant, user);
        const extras = await tenant_extras_service_1.tenantExtraService.getTenantExtras(tenant.id);
        return res.status(200).json({
            message: 'Equipment deleted successfully',
            extras,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete tenant equipment', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res
            .status(500)
            .json({ message: 'Failed to delete tenant equipment' });
    }
};
const deleteTenantInsurance = async (req, res) => {
    const { id } = req.params;
    const { tenant, user } = req.context;
    try {
        await tenant_extras_service_1.tenantExtraService.deleteInsurance(id, tenant, user);
        const extras = await tenant_extras_service_1.tenantExtraService.getTenantExtras(tenant.id);
        return res.status(200).json({
            message: 'Insurance deleted successfully',
            extras,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete tenant insurance', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res
            .status(500)
            .json({ message: 'Failed to delete tenant insurance' });
    }
};
exports.default = {
    getTenantExtras,
    addTenantExtra,
    updateTenantExtra,
    deleteTenantService,
    deleteTenantEquipment,
    deleteTenantInsurance,
};
