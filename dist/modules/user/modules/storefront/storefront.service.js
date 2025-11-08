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
                where: { id: user.id },
            });
            if (!existingUser) {
                throw new Error('Storefront user not found');
            }
            const sameUser = existingUser.id === user.id;
            if (!sameUser) {
                throw new Error('Unauthorized to update this user');
            }
            const updatedUser = await prisma_config_1.default.storefrontUser.update({
                where: { id: user.id },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    dateOfBirth: data.dateOfBirth,
                    street: data.street,
                    countryId: data.countryId,
                    stateId: data.stateId,
                    villageId: data.villageId,
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
}
exports.storefrontUserService = new StorefrontUserService();
