import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class AdminService {
	private readonly logger = new Logger(AdminService.name);

	constructor(private readonly prisma: PrismaService) {}

	async getClientData() {
		try {
			const models = {
				vehicleParts: this.prisma.vehiclePart,
				currencies: this.prisma.currency,
				fuelTypes: this.prisma.fuelType,
				paymentMethods: this.prisma.paymentMethod,
				chargeTypes: this.prisma.chargeType,
				transmissions: this.prisma.transmission,
				vehicleFeatures: this.prisma.vehicleFeature,
				vehicleStatuses: this.prisma.vehicleStatus,
				wheelDrives: this.prisma.wheelDrive,
				fuelPolicies: this.prisma.fuelPolicy,
				countries: this.prisma.country,
				states: this.prisma.state,
				villages: this.prisma.village,
				invoiceSequences: this.prisma.invoiceSequence,
				vehicleModels: this.prisma.vehicleModel,
				vehicleBrands: this.prisma.vehicleBrand,
				vehicleBodyTypes: this.prisma.vehicleBodyType,
				maintenanceServices: this.prisma.maintenanceService,
				documentTypes: this.prisma.documentType,
				presetLocations: this.prisma.presetLocation,
				services: this.prisma.service,
				licenseClasses: this.prisma.licenseClass,
				messengerApps: this.prisma.messengerApp,
				equipments: this.prisma.equipment,
				contactTypes: this.prisma.contactType,
				paymentTypes: this.prisma.paymentType,
				permissions: this.prisma.appPermission,
				vendorTypes: this.prisma.vendorType,
				permissionCategories: this.prisma.permissionCategory,
			};

			const entries = await Promise.all(
				Object.entries(models).map(async ([key, model]) => {
					if (key === "permissions")
						return [
							key,
							await (model as any).findMany({
								include: { category: true },
							}),
						];

					return [key, await (model as any).findMany()];
				}),
			);

			const data = Object.fromEntries(entries);

			return data;
		} catch (error) {}
	}

	async getStorefrontData() {
		try {
			const models = {
				countries: this.prisma.country,
				states: this.prisma.state,
				villages: this.prisma.village,
			};

			const vehicleFeatures = await this.prisma.vehicleFeature.findMany({
				where: {
					vehicles: { some: {} },
				},
			});

			const vehicleBodyTypes = await this.prisma.vehicleBodyType.findMany({
				where: {
					models: {
						some: { vehicles: { some: {} } },
					},
				},
			});

			const caribbeanCountries = await this.prisma.caribbeanCountry.findMany({
				where: {
					country: {
						addresses: {
							some: {},
						},
					},
				},
				include: { country: true },
			});

			const entries = await Promise.all(
				Object.entries(models).map(async ([key, model]) => {
					return [key, await (model as any).findMany()];
				}),
			);

			const data = Object.fromEntries(entries);

			return { ...data, caribbeanCountries, vehicleFeatures, vehicleBodyTypes };
		} catch (error) {
			this.logger.error("Failed to get storefront data", error);
			throw error;
		}
	}
}
