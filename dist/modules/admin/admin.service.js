"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const logger_1 = require("../../config/logger");
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
class AdminService {
    async getAdminData() {
        try {
            const models = {
                vehicleParts: prisma_config_1.default.vehiclePart,
                currencies: prisma_config_1.default.currency,
                fuelTypes: prisma_config_1.default.fuelType,
                paymentMethods: prisma_config_1.default.paymentMethod,
                chargeTypes: prisma_config_1.default.chargeType,
                transmissions: prisma_config_1.default.transmission,
                vehicleFeatures: prisma_config_1.default.vehicleFeature,
                vehicleStatuses: prisma_config_1.default.vehicleStatus,
                wheelDrives: prisma_config_1.default.wheelDrive,
                fuelPolicies: prisma_config_1.default.fuelPolicy,
                countries: prisma_config_1.default.country,
                states: prisma_config_1.default.state,
                villages: prisma_config_1.default.village,
                invoiceSequences: prisma_config_1.default.invoiceSequence,
                vehicleModels: prisma_config_1.default.vehicleModel,
                vehicleBrands: prisma_config_1.default.vehicleBrand,
                vehicleBodyTypes: prisma_config_1.default.vehicleBodyType,
                maintenanceServices: prisma_config_1.default.maintenanceService,
                documentTypes: prisma_config_1.default.documentType,
                presetLocations: prisma_config_1.default.presetLocation,
                services: prisma_config_1.default.service,
                licenseClasses: prisma_config_1.default.licenseClass,
                messengerApps: prisma_config_1.default.messengerApp,
                equipments: prisma_config_1.default.equipment,
                subscriptionPlans: prisma_config_1.default.subscriptionPlan,
                contactTypes: prisma_config_1.default.contactType,
                paymentTypes: prisma_config_1.default.paymentType,
                permissions: prisma_config_1.default.appPermission,
                vendorTypes: prisma_config_1.default.vendorType,
                permissionCategories: prisma_config_1.default.permissionCategory,
            };
            const entries = await Promise.all(Object.entries(models).map(async ([key, model]) => {
                if (key === 'subscriptionPlans')
                    return [
                        key,
                        await model.findMany({ include: { features: true } }),
                    ];
                if (key === 'permissions')
                    return [
                        key,
                        await model.findMany({ include: { category: true } }),
                    ];
                return [key, await model.findMany()];
            }));
            const data = Object.fromEntries(entries);
            return data;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching admin data');
            throw error;
        }
    }
    async getDashboardAdminData() {
        try {
            const models = {
                vehicleParts: prisma_config_1.default.vehiclePart,
                currencies: prisma_config_1.default.currency,
                fuelTypes: prisma_config_1.default.fuelType,
                paymentMethods: prisma_config_1.default.paymentMethod,
                chargeTypes: prisma_config_1.default.chargeType,
                transmissions: prisma_config_1.default.transmission,
                vehicleFeatures: prisma_config_1.default.vehicleFeature,
                vehicleStatuses: prisma_config_1.default.vehicleStatus,
                wheelDrives: prisma_config_1.default.wheelDrive,
                fuelPolicies: prisma_config_1.default.fuelPolicy,
                countries: prisma_config_1.default.country,
                states: prisma_config_1.default.state,
                villages: prisma_config_1.default.village,
                invoiceSequences: prisma_config_1.default.invoiceSequence,
                vehicleModels: prisma_config_1.default.vehicleModel,
                vehicleBrands: prisma_config_1.default.vehicleBrand,
                vehicleBodyTypes: prisma_config_1.default.vehicleBodyType,
                maintenanceServices: prisma_config_1.default.maintenanceService,
                documentTypes: prisma_config_1.default.documentType,
                presetLocations: prisma_config_1.default.presetLocation,
                services: prisma_config_1.default.service,
                licenseClasses: prisma_config_1.default.licenseClass,
                messengerApps: prisma_config_1.default.messengerApp,
                equipments: prisma_config_1.default.equipment,
                subscriptionPlans: prisma_config_1.default.subscriptionPlan,
                contactTypes: prisma_config_1.default.contactType,
                paymentTypes: prisma_config_1.default.paymentType,
                permissions: prisma_config_1.default.appPermission,
                vendorTypes: prisma_config_1.default.vendorType,
                categories: prisma_config_1.default.permissionCategory,
            };
            const entries = await Promise.all(Object.entries(models).map(async ([key, model]) => {
                if (key === 'subscriptionPlans')
                    return [
                        key,
                        await model.findMany({ include: { features: true } }),
                    ];
                return [key, await model.findMany()];
            }));
            const data = Object.fromEntries(entries);
            return data;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching admin data');
            throw error;
        }
    }
    async getStorefrontAdminData() {
        try {
            const models = {
                vehicleFeatures: prisma_config_1.default.vehicleFeature,
                vehicleBodyTypes: prisma_config_1.default.vehicleBodyType,
                caribbeanCountries: prisma_config_1.default.caribbeanCountry,
                countries: prisma_config_1.default.country,
            };
            const entries = await Promise.all(Object.entries(models).map(async ([key, model]) => {
                if (key === 'caribbeanCountries')
                    return [
                        key,
                        await model.findMany({
                            include: { country: true },
                        }),
                    ];
                return [key, await model.findMany()];
            }));
            const data = Object.fromEntries(entries);
            return data;
        }
        catch (error) { }
    }
}
exports.adminService = new AdminService();
