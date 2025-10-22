import { logger } from '../../config/logger';
import prisma from '../../config/prisma.config';

class AdminService {
  async getAdminData() {
    try {
      const models = {
        vehicleParts: prisma.vehiclePart,
        currencies: prisma.currency,
        fuelTypes: prisma.fuelType,
        paymentMethods: prisma.paymentMethod,
        chargeTypes: prisma.chargeType,
        transmissions: prisma.transmission,
        vehicleFeatures: prisma.vehicleFeature,
        vehicleStatuses: prisma.vehicleStatus,
        wheelDrives: prisma.wheelDrive,
        fuelPolicies: prisma.fuelPolicy,
        countries: prisma.country,
        states: prisma.state,
        villages: prisma.village,
        invoiceSequences: prisma.invoiceSequence,
        vehicleModels: prisma.vehicleModel,
        vehicleBrands: prisma.vehicleBrand,
        vehicleBodyTypes: prisma.vehicleBodyType,
        maintenanceServices: prisma.maintenanceService,
        documentTypes: prisma.documentType,
        presetLocations: prisma.presetLocation,
        services: prisma.service,
        licenseClasses: prisma.licenseClass,
        messengerApps: prisma.messengerApp,
        equipments: prisma.equipment,
        subscriptionPlans: prisma.subscriptionPlan,
        contactTypes: prisma.contactType,
        paymentTypes: prisma.paymentType,
        permissions: prisma.appPermission,
        vendorTypes: prisma.vendorType,
        permissionCategories: prisma.permissionCategory,
      };

      const entries = await Promise.all(
        Object.entries(models).map(async ([key, model]) => {
          if (key === 'subscriptionPlans')
            return [
              key,
              await (model as any).findMany({ include: { features: true } }),
            ];

          if (key === 'permissions')
            return [
              key,
              await (model as any).findMany({ include: { category: true } }),
            ];

          return [key, await (model as any).findMany()];
        }),
      );

      const data = Object.fromEntries(entries);

      return data;
    } catch (error) {
      logger.e(error, 'Error fetching admin data');
      throw error;
    }
  }

  async getDashboardAdminData() {
    try {
      const models = {
        vehicleParts: prisma.vehiclePart,
        currencies: prisma.currency,
        fuelTypes: prisma.fuelType,
        paymentMethods: prisma.paymentMethod,
        chargeTypes: prisma.chargeType,
        transmissions: prisma.transmission,
        vehicleFeatures: prisma.vehicleFeature,
        vehicleStatuses: prisma.vehicleStatus,
        wheelDrives: prisma.wheelDrive,
        fuelPolicies: prisma.fuelPolicy,
        countries: prisma.country,
        states: prisma.state,
        villages: prisma.village,
        invoiceSequences: prisma.invoiceSequence,
        vehicleModels: prisma.vehicleModel,
        vehicleBrands: prisma.vehicleBrand,
        vehicleBodyTypes: prisma.vehicleBodyType,
        maintenanceServices: prisma.maintenanceService,
        documentTypes: prisma.documentType,
        presetLocations: prisma.presetLocation,
        services: prisma.service,
        licenseClasses: prisma.licenseClass,
        messengerApps: prisma.messengerApp,
        equipments: prisma.equipment,
        subscriptionPlans: prisma.subscriptionPlan,
        contactTypes: prisma.contactType,
        paymentTypes: prisma.paymentType,
        permissions: prisma.appPermission,
        vendorTypes: prisma.vendorType,
        categories: prisma.permissionCategory,
      };

      const entries = await Promise.all(
        Object.entries(models).map(async ([key, model]) => {
          if (key === 'subscriptionPlans')
            return [
              key,
              await (model as any).findMany({ include: { features: true } }),
            ];

          return [key, await (model as any).findMany()];
        }),
      );

      const data = Object.fromEntries(entries);

      return data;
    } catch (error) {
      logger.e(error, 'Error fetching admin data');
      throw error;
    }
  }

  async getStorefrontAdminData() {
    try {
      const models = {
        vehicleFeatures: prisma.vehicleFeature,
        vehicleBodyTypes: prisma.vehicleBodyType,
        caribbeanCountries: prisma.caribbeanCountry,
        countries: prisma.country,
      };

      const entries = await Promise.all(
        Object.entries(models).map(async ([key, model]) => {
          if (key === 'caribbeanCountries')
            return [
              key,
              await (model as any).findMany({
                include: { country: true },
              }),
            ];

          return [key, await (model as any).findMany()];
        }),
      );

      const data = Object.fromEntries(entries);

      return data;
    } catch (error) {}
  }
}

export const adminService = new AdminService();
