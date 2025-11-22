"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_service_1 = __importStar(require("./tenant.service"));
const logger_1 = require("../../config/logger");
const tenant_dto_1 = require("./dto/tenant.dto");
const tenant_repository_1 = require("../../repository/tenant.repository");
const tenant_extras_service_1 = require("./modules/tenant-extras/tenant-extras.service");
const tenant_location_service_1 = require("./modules/tenant-location/tenant-location.service");
const vehicle_service_1 = require("../vehicle/vehicle.service");
const customer_service_1 = require("../customer/customer.service");
const booking_service_1 = require("../booking/booking.service");
const tenant_activity_service_1 = require("./modules/tenant-activity/tenant-activity.service");
const user_repository_1 = require("../user/user.repository");
const user_role_service_1 = require("../user/modules/user-role/user-role.service");
const tenant_violation_service_1 = require("./modules/tenant-violation/tenant-violation.service");
const currency_rates_service_1 = require("./modules/currency-rates/currency-rates.service");
const email_service_1 = require("../email/email.service");
const tenant_vendor_service_1 = require("./modules/tenant-vendor/tenant-vendor.service");
const vehicle_maintenance_service_1 = require("../vehicle/modules/vehicle-maintanance/vehicle-maintenance.service");
const tenant_notification_service_1 = require("./modules/tenant-notification/tenant-notification.service");
const getCurrentTenant = async (req, res) => {
    const { tenant, user } = req.context;
    try {
        const extras = await tenant_extras_service_1.tenantExtraService.getTenantExtras(tenant.id);
        const locations = await tenant_location_service_1.tenantLocationService.getAllLocations(tenant);
        const vehicles = await vehicle_service_1.vehicleService.getTenantVehicles(tenant);
        const customers = await customer_service_1.customerService.getTenantCustomers(tenant);
        const bookings = await booking_service_1.bookingService.getTenantBookings(tenant);
        const activity = await tenant_activity_service_1.tenantActivityService.getTenantActivities(tenant);
        const users = await user_repository_1.userRepo.getUsers(tenant.id);
        const roles = await user_role_service_1.userRoleService.getTenantRoles(tenant);
        const violations = await tenant_violation_service_1.tenantViolationsService.getTenantViolations(tenant);
        const currencyRates = await currency_rates_service_1.tenantCurrencyRatesService.getTenantCurrencyRates(tenant);
        const vendors = await tenant_vendor_service_1.tenantVendorService.getTenantVendors(tenant);
        const scheduledMaintenances = await vehicle_maintenance_service_1.vehicleMaintenanceService.getTenantMaintenanceServices(tenant);
        const notifications = await tenant_notification_service_1.tenantNotificationService.getNotifications(tenant, user);
        return res.status(200).json({
            tenant,
            extras,
            locations,
            vehicles,
            customers,
            bookings,
            activity,
            scheduledMaintenances,
            users,
            roles,
            violations,
            currencyRates,
            vendors,
            notifications,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get tenant', {
            tenantCode: tenant.tenantCode,
            tenantId: tenant.id,
        });
        return res
            .status(500)
            .json({ message: error.message || 'Failed to get tenant' });
    }
};
const getTenantById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(id);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { id });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        return res.status(200).json(tenant);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get tenant', { id });
        return res.status(500).json({ message: 'Failed to get tenant' });
    }
};
const createTenant = async (req, res) => {
    const data = req.body;
    const tenantDto = await tenant_service_1.tenantService.validateCreateTenantData(data);
    try {
        const { tenant, token } = await tenant_service_1.tenantService.createTenant(tenantDto);
        if (typeof token !== 'string') {
            await email_service_1.emailService.sendBusinessVerificationEmail(tenant, token);
        }
        return res.status(201).json({
            message: 'Tenant created successfully',
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            tenantName: tenant.tenantName,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to create tenant', {
            email: tenantDto.email,
            tenantName: tenantDto.tenantName,
        });
        return res
            .status(500)
            .json({ message: error.message || 'Failed to create tenant' });
    }
};
const updateTenant = async (req, res) => {
    const data = req.body;
    const { tenant } = req.context;
    if (!data) {
        logger_1.logger.w('Tenant data is missing', {
            tenantCode: tenant.tenantCode,
            tenantId: tenant.id,
        });
        return res.status(400).json({ message: 'Tenant data is required' });
    }
    const parseResult = tenant_dto_1.UpdateTenantDtoSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid tenant data',
            details: parseResult.error.issues,
        });
    }
    const tenantDto = parseResult.data;
    try {
        await tenant_service_1.default.updateTenant(tenantDto, tenant);
        const updatedTenant = await tenant_repository_1.tenantRepo.getTenantById(tenant.id);
        return res.status(200).json({
            message: 'Settings updated successfully',
            tenant: updatedTenant,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update tenant', {
            tenantCode: tenant.tenantCode,
            tenantId: tenant.id,
            data,
        });
        return res.status(500).json({ message: 'Failed to update settings' });
    }
};
const updateStorefrontSettings = async (req, res) => {
    const data = req.body;
    const { tenant, user } = req.context;
    try {
        await tenant_service_1.tenantService.updateStorefrontSettings(data, tenant, user);
        const updatedTenant = await tenant_repository_1.tenantRepo.getTenantById(tenant.id);
        const vehicles = await vehicle_service_1.vehicleService.getTenantVehicles(tenant);
        return res.status(200).json({
            message: 'Storefront updated successfully',
            tenant: updatedTenant,
            vehicles,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update storefront settings', {
            tenantCode: tenant.tenantCode,
            tenantId: tenant.id,
            userId: user.id,
            data,
        });
        return res.status(500).json({
            message: error.message || 'Failed to update storefront settings',
        });
    }
};
exports.default = {
    getCurrentTenant,
    getTenantById,
    createTenant,
    updateTenant,
    updateStorefrontSettings,
};
