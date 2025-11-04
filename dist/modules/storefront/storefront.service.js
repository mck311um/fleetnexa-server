"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontService = void 0;
const logger_1 = require("../../config/logger");
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
const tenant_extras_service_1 = require("../tenant/modules/tenant-extras/tenant-extras.service");
class StorefrontService {
    async getTenants() {
        try {
            const tenants = await prisma_config_1.default.tenant.findMany({
                where: {
                    storefrontEnabled: true,
                    tenantLocations: {
                        some: { storefrontEnabled: true, isDeleted: false },
                    },
                    vehicles: {
                        some: {
                            storefrontEnabled: true,
                            isDeleted: false,
                        },
                    },
                },
                select: {
                    id: true,
                    tenantName: true,
                    slug: true,
                    logo: true,
                    rating: true,
                    description: true,
                    email: true,
                    number: true,
                    _count: {
                        select: {
                            vehicles: {
                                where: { storefrontEnabled: true, isDeleted: false },
                            },
                            ratings: true,
                        },
                    },
                    ratings: true,
                    address: {
                        include: {
                            country: true,
                            state: true,
                            village: true,
                        },
                    },
                },
            });
            return tenants;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching tenants for storefront');
            throw error;
        }
    }
    async getTenantBySlug(slug) {
        try {
            const tenant = await prisma_config_1.default.tenant.findUnique({
                where: { slug, storefrontEnabled: true },
                select: {
                    id: true,
                    tenantName: true,
                    slug: true,
                    logo: true,
                    rating: true,
                    description: true,
                    email: true,
                    number: true,
                    _count: {
                        select: {
                            vehicles: {
                                where: { storefrontEnabled: true, isDeleted: false },
                            },
                            ratings: true,
                        },
                    },
                    ratings: true,
                    address: {
                        include: {
                            country: true,
                            state: true,
                            village: true,
                        },
                    },
                    vehicles: {
                        where: {
                            storefrontEnabled: true,
                            tenant: {
                                storefrontEnabled: true,
                            },
                        },
                        select: {
                            id: true,
                            year: true,
                            color: true,
                            licensePlate: true,
                            engineVolume: true,
                            steering: true,
                            fuelLevel: true,
                            featuredImage: true,
                            vehicleStatus: true,
                            wheelDrive: true,
                            images: true,
                            brand: true,
                            numberOfSeats: true,
                            numberOfDoors: true,
                            transmission: true,
                            features: true,
                            fuelType: true,
                            dayPrice: true,
                            minimumRental: true,
                            drivingExperience: true,
                            discounts: true,
                            model: {
                                include: {
                                    bodyType: true,
                                },
                            },
                            rentals: {
                                where: {
                                    status: {
                                        in: ['PENDING', 'ACTIVE', 'COMPLETED'],
                                    },
                                },
                                select: {
                                    startDate: true,
                                    endDate: true,
                                },
                            },
                            tenant: {
                                select: {
                                    id: true,
                                    tenantName: true,
                                    slug: true,
                                    currency: true,
                                    logo: true,
                                    securityDeposit: true,
                                    currencyRates: {
                                        include: {
                                            currency: true,
                                        },
                                    },
                                    address: {
                                        include: {
                                            country: true,
                                            state: true,
                                            village: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            return tenant;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching tenant by slug for storefront');
            throw error;
        }
    }
    async getVehicles() {
        try {
            const vehicles = await prisma_config_1.default.vehicle.findMany({
                where: {
                    storefrontEnabled: true,
                    isDeleted: false,
                    tenant: {
                        storefrontEnabled: true,
                    },
                },
                select: {
                    id: true,
                    year: true,
                    color: true,
                    licensePlate: true,
                    engineVolume: true,
                    steering: true,
                    fuelLevel: true,
                    featuredImage: true,
                    vehicleStatus: true,
                    wheelDrive: true,
                    images: true,
                    brand: true,
                    numberOfSeats: true,
                    numberOfDoors: true,
                    transmission: true,
                    features: true,
                    fuelType: true,
                    dayPrice: true,
                    minimumRental: true,
                    drivingExperience: true,
                    discounts: true,
                    model: {
                        include: {
                            bodyType: true,
                        },
                    },
                    rentals: {
                        where: {
                            status: {
                                in: ['PENDING', 'ACTIVE', 'COMPLETED'],
                            },
                        },
                        select: {
                            startDate: true,
                            endDate: true,
                        },
                    },
                    tenant: {
                        select: {
                            id: true,
                            tenantName: true,
                            slug: true,
                            currency: true,
                            logo: true,
                            securityDeposit: true,
                            tenantLocations: {
                                where: { storefrontEnabled: true, isDeleted: false },
                            },
                            currencyRates: {
                                include: {
                                    currency: true,
                                },
                            },
                            address: {
                                include: {
                                    country: true,
                                    state: true,
                                    village: true,
                                },
                            },
                        },
                    },
                },
            });
            const tenantIds = [
                ...new Set(vehicles.map((v) => v.tenant?.id).filter(Boolean)),
            ];
            const tenantExtrasPromises = tenantIds.map((id) => tenant_extras_service_1.tenantExtraService.getTenantExtras(id || ''));
            const tenantExtrasResults = await Promise.all(tenantExtrasPromises);
            const tenantExtras = tenantExtrasResults.flat();
            const vehiclesWithExtras = vehicles.map((vehicle) => ({
                ...vehicle,
                tenant: {
                    ...vehicle.tenant,
                    extras: tenantExtras.filter((extra) => extra.tenantId === vehicle?.tenant?.id),
                },
            }));
            return vehiclesWithExtras;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching vehicles for storefront');
            throw error;
        }
    }
    async getVehicleById(id) {
        try {
            const vehicle = await prisma_config_1.default.vehicle.findFirst({
                where: {
                    id,
                    storefrontEnabled: true,
                    isDeleted: false,
                    tenant: {
                        storefrontEnabled: true,
                    },
                },
                select: {
                    id: true,
                    year: true,
                    color: true,
                    licensePlate: true,
                    engineVolume: true,
                    steering: true,
                    fuelLevel: true,
                    featuredImage: true,
                    vehicleStatus: true,
                    wheelDrive: true,
                    images: true,
                    brand: true,
                    numberOfSeats: true,
                    numberOfDoors: true,
                    transmission: true,
                    features: true,
                    fuelType: true,
                    dayPrice: true,
                    minimumRental: true,
                    drivingExperience: true,
                    discounts: true,
                    model: {
                        include: {
                            bodyType: true,
                        },
                    },
                    rentals: {
                        where: {
                            status: {
                                in: ['PENDING', 'ACTIVE', 'COMPLETED'],
                            },
                        },
                        select: {
                            startDate: true,
                            endDate: true,
                        },
                    },
                    tenant: {
                        select: {
                            id: true,
                            tenantName: true,
                            slug: true,
                            currency: true,
                            logo: true,
                            securityDeposit: true,
                            currencyRates: {
                                include: {
                                    currency: true,
                                },
                            },
                            tenantLocations: {
                                where: { storefrontEnabled: true, isDeleted: false },
                            },
                            address: {
                                include: {
                                    country: true,
                                    state: true,
                                    village: true,
                                },
                            },
                        },
                    },
                },
            });
            const tenantExtras = await tenant_extras_service_1.tenantExtraService.getTenantExtras(vehicle?.tenant?.id || '');
            const vehicleWithExtras = vehicle
                ? {
                    ...vehicle,
                    tenant: {
                        ...vehicle.tenant,
                        extras: tenantExtras,
                    },
                }
                : null;
            return vehicleWithExtras;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching vehicle by ID for storefront');
            throw error;
        }
    }
    async rateTenant(data, tenant) {
        try {
            const newRating = await prisma_config_1.default.tenantRatings.create({
                data: {
                    tenantId: tenant.id,
                    rating: data.rating,
                    comment: data.comment,
                    fullName: data.fullName,
                    email: data.email,
                },
            });
            // Recalculate tenant average rating
            const ratings = await prisma_config_1.default.tenantRatings.findMany({
                where: { tenantId: tenant.id },
                select: { rating: true },
            });
            const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
            await prisma_config_1.default.tenant.update({
                where: { id: tenant.id },
                data: { rating: averageRating },
            });
            return newRating;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error rating tenant in storefront');
            throw error;
        }
    }
}
exports.storefrontService = new StorefrontService();
