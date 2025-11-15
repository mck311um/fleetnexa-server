"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontUserService = void 0;
const logger_1 = require("../../../../config/logger");
const storefront_dto_1 = require("./storefront.dto");
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class StorefrontUserService {
    async validateUserData(data) {
        if (!data) {
            throw new Error('User data is required');
        }
        const safeParse = storefront_dto_1.StorefrontUserSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('Admin user data validation failed', {
                details: safeParse.error.issues,
            });
            throw new Error('Storefront user data validation failed');
        }
        return safeParse.data;
    }
    async validatePasswordData(data) {
        if (!data) {
            throw new Error('Password data is required');
        }
        const safeParse = storefront_dto_1.ChangePasswordSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('Storefront user password data validation failed', {
                details: safeParse.error.issues,
            });
            throw new Error('Storefront user password data validation failed');
        }
        return safeParse.data;
    }
    async getCurrentUser(userId) {
        try {
            const user = await prisma_config_1.default.storefrontUser.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true,
                    email: true,
                    profilePicture: true,
                    driverLicenseNumber: true,
                    licenseExpiry: true,
                    licenseIssued: true,
                    license: true,
                    country: true,
                    countryId: true,
                    street: true,
                    village: true,
                    villageId: true,
                    state: true,
                    stateId: true,
                    phone: true,
                },
            });
            if (!user) {
                throw new Error('Storefront user not found');
            }
            const userData = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                initials: `${user.firstName[0]}${user.lastName[0]}`,
                fullName: `${user.firstName} ${user.lastName}`,
                createdAt: user.createdAt,
                email: user.email,
                profilePicture: user.profilePicture || null,
                driverLicenseNumber: user.driverLicenseNumber,
                licenseExpiry: user.licenseExpiry,
                licenseIssued: user.licenseIssued,
                license: user.license,
                country: user.country?.country,
                countryId: user.countryId,
                street: user.street,
                village: user.village?.village,
                villageId: user.villageId,
                state: user.state?.state,
                stateId: user.stateId,
                phone: user.phone,
            };
            return userData;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching current storefront user', {
                userId,
            });
            throw new Error('Error fetching current storefront user');
        }
    }
    async updateStorefrontUser(data, user) {
        try {
            const existingUser = await prisma_config_1.default.storefrontUser.findUnique({
                where: { id: data.id },
            });
            if (!existingUser) {
                throw new Error('Storefront user not found');
            }
            console.log(user);
            const updatedUser = await prisma_config_1.default.storefrontUser.update({
                where: { id: data.id },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    dateOfBirth: data.dateOfBirth,
                    street: data.street || null,
                    countryId: data.countryId || null,
                    stateId: data.stateId || null,
                    villageId: data.villageId || null,
                    driverLicenseNumber: data.driversLicenseNumber,
                    licenseExpiry: data.licenseExpiry,
                    licenseIssued: data.licenseIssued,
                    license: data.license,
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true,
                    email: true,
                    profilePicture: true,
                    driverLicenseNumber: true,
                    licenseExpiry: true,
                    licenseIssued: true,
                    country: true,
                    countryId: true,
                    street: true,
                    village: true,
                    villageId: true,
                    state: true,
                    stateId: true,
                    phone: true,
                },
            });
            const userData = {
                id: user.id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                initials: `${updatedUser.firstName[0]}${updatedUser.lastName[0]}`,
                fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
                createdAt: updatedUser.createdAt,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture || null,
                driverLicenseNumber: updatedUser.driverLicenseNumber,
                licenseExpiry: updatedUser.licenseExpiry,
                licenseIssued: updatedUser.licenseIssued,
                country: updatedUser.country?.country,
                countryId: updatedUser.countryId,
                street: updatedUser.street,
                village: updatedUser.village?.village,
                villageId: updatedUser.villageId,
                state: updatedUser.state?.state,
                stateId: updatedUser.stateId,
                phone: updatedUser.phone,
            };
            return userData;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error updating storefront user', {
                userId: user.id,
                data,
            });
            throw error;
        }
    }
    async updatePassword(data, user) {
        try {
            const existingUser = await prisma_config_1.default.storefrontUser.findUnique({
                where: { id: user.id },
            });
            if (!existingUser) {
                logger_1.logger.w(`Storefront user not found (ID: ${user.id})`);
                throw new Error('Storefront user not found');
            }
            const sameUser = existingUser.id === user.id;
            if (!sameUser) {
                logger_1.logger.w(`Unauthorized password change attempt (User ID: ${user.id})`);
                throw new Error('Unauthorized to change this user password');
            }
            const isMatch = await bcrypt_1.default.compare(data.currentPassword, existingUser.password);
            if (!isMatch) {
                logger_1.logger.w(`Incorrect password attempt (User ID: ${user.id})`);
                throw new Error('Incorrect current password');
            }
            const samePassword = await bcrypt_1.default.compare(data.newPassword, existingUser.password);
            if (samePassword) {
                logger_1.logger.w(`New password matches current password (User ID: ${user.id})`);
                throw new Error('Password must be different from the current password');
            }
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(data.newPassword, salt);
            await prisma_config_1.default.storefrontUser.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error updating storefront user password', {
                userId: user.id,
                data,
            });
            throw error;
        }
    }
    async getPreviousBookings(user) {
        try {
            const customers = await prisma_config_1.default.customer.findMany({
                where: {
                    storefrontId: user.id,
                    isDeleted: false,
                    drivers: {
                        some: {
                            rental: {
                                is: {
                                    agent: 'STOREFRONT',
                                },
                            },
                        },
                    },
                },
                select: {
                    drivers: {
                        select: {
                            rental: {
                                select: {
                                    id: true,
                                    rentalNumber: true,
                                    bookingCode: true,
                                    startDate: true,
                                    endDate: true,
                                    status: true,
                                    vehicle: {
                                        select: {
                                            year: true,
                                            brand: true,
                                            model: true,
                                            tenant: {
                                                select: {
                                                    tenantName: true,
                                                    address: {
                                                        select: {
                                                            street: true,
                                                            village: true,
                                                            state: true,
                                                            country: true,
                                                        },
                                                    },
                                                    currency: true,
                                                    currencyRates: {
                                                        include: {
                                                            currency: true,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    values: {
                                        select: {
                                            netTotal: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            const bookingData = customers.map((customer) => {
                return customer.drivers.map((driver) => {
                    const rental = driver.rental;
                    return {
                        startDate: rental.startDate,
                        endDate: rental.endDate,
                        status: rental.status,
                        netTotal: rental.values?.netTotal,
                        id: rental.id,
                        rentalNumber: rental.rentalNumber,
                        bookingCode: rental.bookingCode,
                        vehicle: {
                            year: rental.vehicle.year,
                            brand: rental.vehicle.brand.brand,
                            model: rental.vehicle.model.model,
                        },
                        tenant: rental.vehicle.tenant
                            ? {
                                tenantName: rental.vehicle.tenant.tenantName,
                                street: rental.vehicle.tenant.address?.street,
                                village: rental.vehicle.tenant.address?.village?.village,
                                state: rental.vehicle.tenant.address?.state?.state,
                                country: rental.vehicle.tenant.address?.country?.country,
                                address: rental.vehicle.tenant.address,
                                currency: rental.vehicle.tenant.currency,
                                currencyRates: rental.vehicle.tenant.currencyRates,
                            }
                            : null,
                    };
                });
            });
            return bookingData.flat();
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching previous storefront user bookings', {
                userId: user.id,
            });
            throw error;
        }
    }
    async deleteUser(password, user) {
        try {
            const existingUser = await prisma_config_1.default.storefrontUser.findUnique({
                where: { id: user.id },
            });
            if (!existingUser) {
                logger_1.logger.w(`Storefront user not found (ID: ${user.id})`);
                throw new Error('Storefront user not found');
            }
            const isMatch = await bcrypt_1.default.compare(password, existingUser.password);
            if (!isMatch) {
                logger_1.logger.w(`Incorrect password attempt (User ID: ${user.id})`);
                throw new Error('Incorrect credentials');
            }
            await prisma_config_1.default.customer.updateMany({
                where: {
                    storefrontId: user.id,
                },
                data: { storefrontId: null },
            });
            await prisma_config_1.default.storefrontUser.delete({
                where: { id: user.id },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error deleting storefront user', {
                userId: user.id,
            });
            throw error;
        }
    }
}
exports.storefrontUserService = new StorefrontUserService();
