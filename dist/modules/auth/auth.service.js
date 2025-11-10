"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const logger_1 = require("../../config/logger");
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
const auth_dto_1 = require("./auth.dto");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generator_service_1 = __importDefault(require("../../services/generator.service"));
const email_service_1 = require("../email/email.service");
class AuthService {
    async validateAdminUserData(data) {
        if (!data) {
            throw new Error('Admin user data is required');
        }
        const safeParse = auth_dto_1.AdminUserSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('Admin user data validation failed', {
                details: safeParse.error.issues,
            });
            throw new Error('Admin user data validation failed');
        }
        return safeParse.data;
    }
    async validateStorefrontUserData(data) {
        if (!data) {
            throw new Error('Storefront user data is required');
        }
        const safeParse = auth_dto_1.StorefrontUserSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('Storefront user data validation failed', {
                details: safeParse.error.issues,
            });
            throw new Error('Storefront user data validation failed');
        }
        return safeParse.data;
    }
    async validateAdminUser(data) {
        const user = await prisma_config_1.default.adminUser.findUnique({
            where: { username: data.username },
        });
        if (!user)
            return null;
        const isMatch = await bcrypt_1.default.compare(data.password, user.password);
        if (!isMatch)
            return null;
        const userData = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            initials: `${user.firstName[0]}${user.lastName[0]}`,
            fullName: `${user.firstName} ${user.lastName}`,
        };
        const payload = { adminUser: { id: user.id, username: user.username } };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: data.rememberMe ? '30d' : '7d',
        });
        return { userData, token };
    }
    async createAdminUser(data) {
        const existingUser = await prisma_config_1.default.adminUser.findUnique({
            where: { username: data.username },
        });
        if (existingUser) {
            throw new Error('Username already exists');
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        const newUser = await prisma_config_1.default.adminUser.create({
            data: {
                username: data.username,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
            },
        });
        return {
            id: newUser.id,
            username: newUser.username,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            initials: `${newUser.firstName[0]}${newUser.lastName[0]}`,
            fullName: `${newUser.firstName} ${newUser.lastName}`,
        };
    }
    async createStorefrontUser(data) {
        try {
            const existingUser = await prisma_config_1.default.storefrontUser.findUnique({
                where: { email: data.email },
            });
            if (existingUser) {
                throw new Error('An account with these credentials already exists.');
            }
            const existingPhone = await prisma_config_1.default.storefrontUser.findFirst({
                where: { phone: data.phone },
            });
            if (existingPhone) {
                throw new Error('An account with these credentials already exists.');
            }
            const existingLicense = await prisma_config_1.default.storefrontUser.findFirst({
                where: { driverLicenseNumber: data.driversLicenseNumber },
            });
            if (existingLicense) {
                throw new Error('An account with these credentials already exists.');
            }
            const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
            const user = await prisma_config_1.default.storefrontUser.create({
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    gender: data.gender || 'male',
                    phone: data.phone || '',
                    password: hashedPassword,
                    driverLicenseNumber: data.driversLicenseNumber,
                    licenseExpiry: new Date(data.licenseExpiry),
                    licenseIssued: new Date(data.licenseIssued),
                    license: data.license,
                    dateOfBirth: new Date(data.dateOfBirth),
                    street: data.street || '',
                    countryId: data.countryId || null,
                    stateId: data.stateId || null,
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
            const payload = {
                storefrontUser: { id: user.id },
            };
            const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '7d',
            });
            return { userData, token };
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to create storefront user', {
                email: data.email,
            });
            throw error;
        }
    }
    async validateStorefrontUser(data) {
        try {
            const user = await prisma_config_1.default.storefrontUser.findUnique({
                where: { email: data.username },
            });
            if (!user) {
                logger_1.logger.w('Invalid email or password', { email: data.username });
                throw new Error('Invalid email or password');
            }
            const isMatch = await bcrypt_1.default.compare(data.password, user.password);
            if (!isMatch) {
                logger_1.logger.w('Invalid email or password', { email: data.username });
                throw new Error('Invalid email or password');
            }
            const userData = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                initials: `${user.firstName[0]}${user.lastName[0]}`,
                fullName: `${user.firstName} ${user.lastName}`,
                email: user.email,
                driverLicenseNumber: user.driverLicenseNumber,
                licenseExpiry: user.licenseExpiry,
                licenseIssued: user.licenseIssued,
                dateOfBirth: user.dateOfBirth,
            };
            const payload = {
                storefrontUser: { id: user.id },
            };
            const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
                expiresIn: data.rememberMe ? '30d' : '7d',
            });
            return { userData, token };
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to validate storefront user', {
                email: data.username,
            });
            throw new Error('Failed to validate storefront user');
        }
    }
    async requestStorefrontPasswordReset(email) {
        try {
            const user = await prisma_config_1.default.storefrontUser.findUnique({
                where: { email },
            });
            if (!user) {
                throw new Error('No user found with the provided email');
            }
            await prisma_config_1.default.emailTokens.updateMany({
                where: { email, expired: false },
                data: { expired: true },
            });
            const resetToken = generator_service_1.default.generateVerificationCode();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
            await prisma_config_1.default.emailTokens.create({
                data: {
                    email,
                    token: resetToken,
                    expiresAt,
                },
            });
            await email_service_1.emailService.sendStorefrontPasswordResetEmail(resetToken, email);
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to request password reset', { email });
            throw error;
        }
    }
    async verifyStorefrontPasswordResetToken(data) {
        try {
            const record = await prisma_config_1.default.emailTokens.findFirst({
                where: {
                    email: data.email,
                    token: data.token,
                    expired: false,
                    expiresAt: { gt: new Date() },
                },
            });
            if (!record) {
                throw new Error('Invalid or expired token');
            }
            await prisma_config_1.default.emailTokens.updateMany({
                where: { email: data.email, token: data.token },
                data: { expired: true, verified: true },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to verify password reset token', {
                email: data.email,
                token: data.token,
            });
            throw error;
        }
    }
    async resetStorefrontPassword(data) {
        try {
            const hashedPassword = await bcrypt_1.default.hash(data.newPassword, 10);
            const user = await prisma_config_1.default.storefrontUser.findUnique({
                where: { email: data.email },
            });
            const passwordCompare = await bcrypt_1.default.compare(data.newPassword, user?.password || '');
            if (passwordCompare) {
                throw new Error('New password must be different from the old password');
            }
            await prisma_config_1.default.storefrontUser.updateMany({
                where: { email: data.email },
                data: { password: hashedPassword },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to reset storefront password', {
                email: data.email,
            });
            throw error;
        }
    }
    async validateTenantUser(data) {
        try {
            const user = await prisma_config_1.default.user.findFirst({
                where: { OR: [{ username: data.username }, { email: data.username }] },
                include: {
                    tenant: true,
                    role: {
                        include: {
                            rolePermission: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!user) {
                logger_1.logger.w('Failed to validate tenant user - user not found', {
                    username: data.username,
                });
                throw new Error('Failed to validate user');
            }
            const isMatch = await bcrypt_1.default.compare(data.password, user.password);
            if (!isMatch) {
                logger_1.logger.w('Failed to validate tenant user - invalid password', {
                    username: data.username,
                });
                throw new Error('Failed to validate user');
            }
            const userData = {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                initials: `${user.firstName[0]}${user.lastName[0]}`,
                fullName: `${user.firstName} ${user.lastName}`,
                tenantId: user.tenantId,
                tenantCode: user.tenant?.tenantCode,
                roleId: user.roleId,
                requirePasswordChange: user.requirePasswordChange,
                role: user.role,
            };
            const payload = {
                user: {
                    id: user.id,
                    tenantId: user.tenantId,
                    tenantCode: user.tenant?.tenantCode,
                },
            };
            const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
                expiresIn: data.rememberMe ? '30d' : '7d',
            });
            return { userData, token };
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to validate tenant user', {
                username: data.username,
            });
            throw error;
        }
    }
    async generateVerificationToken(tenant) {
        try {
            const alreadyVerified = await prisma_config_1.default.emailVerification.findFirst({
                where: {
                    tenantId: tenant.id,
                    verified: true,
                    expiresAt: { gt: new Date() },
                },
            });
            if (alreadyVerified) {
                throw new Error('Email already verified');
            }
            const existingToken = await prisma_config_1.default.emailVerification.findFirst({
                where: {
                    tenantId: tenant.id,
                    verified: false,
                    expiresAt: { gt: new Date() },
                },
            });
            if (existingToken) {
                return existingToken.token;
            }
            const token = generator_service_1.default.generateVerificationCode();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            return await prisma_config_1.default.emailVerification.create({
                data: {
                    email: tenant.email,
                    token,
                    expiresAt,
                    tenantId: tenant.id,
                },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to generate email verification token', {
                tenantId: tenant.id,
            });
            throw new Error('Failed to generate email verification token');
        }
    }
    async verifyEmailToken(tenant, token) {
        try {
            const record = await prisma_config_1.default.emailVerification.findFirst({
                where: {
                    tenantId: tenant.id,
                    token,
                    verified: false,
                    expiresAt: { gt: new Date() },
                },
            });
            if (!record) {
                throw new Error('Invalid or expired token');
            }
            await prisma_config_1.default.emailVerification.update({
                where: { id: record.id },
                data: { verified: true },
            });
            await prisma_config_1.default.tenant.update({
                where: { id: tenant.id },
                data: { emailVerified: true },
            });
            return true;
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to verify email token', {
                tenantId: tenant.id,
                token,
            });
            throw new Error('Failed to verify email token');
        }
    }
}
exports.authService = new AuthService();
