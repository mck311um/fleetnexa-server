"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontService = void 0;
const logger_1 = require("../../config/logger");
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
class StorefrontService {
    async getTenants() {
        try {
            const tenants = await prisma_config_1.default.tenant.findMany({
                where: { storefrontEnabled: true },
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
                            vehicles: true,
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
                            vehicles: true,
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
            return vehicles;
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
            return vehicle;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching vehicle by ID for storefront');
            throw error;
        }
    }
}
exports.storefrontService = new StorefrontService();
