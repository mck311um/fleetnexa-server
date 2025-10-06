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
    async validateTenantUser(data) {
        try {
            const user = await prisma_config_1.default.user.findUnique({
                where: { username: data.username },
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
                tenantId: user.tenantId,
                tenantCode: user.tenant?.tenantCode,
                roleId: user.roleId,
                requirePasswordChange: user.requirePasswordChange,
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
            throw new Error('Failed to validate user');
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
