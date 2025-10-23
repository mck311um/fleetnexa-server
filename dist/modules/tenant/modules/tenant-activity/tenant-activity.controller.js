"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../../../config/logger");
const tenant_repository_1 = require("../../../../repository/tenant.repository");
const tenant_activity_service_1 = require("./tenant-activity.service");
const getTenantActivities = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        const activities = await tenant_activity_service_1.tenantActivityService.getTenantActivities(tenant);
        return res.status(200).json(activities);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get tenant activities', {
            tenantId,
            tenantCode,
        });
        return res.status(500).json({ message: 'Failed to get tenant activities' });
    }
};
exports.default = {
    getTenantActivities,
};
