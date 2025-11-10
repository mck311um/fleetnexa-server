"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantUserService = void 0;
const logger_1 = require("../../../../config/logger");
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const generator_service_1 = __importDefault(require("../../../../services/generator.service"));
const tenant_user_dto_1 = require("./tenant-user.dto");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_service_1 = require("../../../email/email.service");
const user_dto_1 = require("../../user.dto");
const auth_dto_1 = require("../../../auth/auth.dto");
class TenantUserService {
    async validateLoginData(data) {
        if (!data) {
            throw new Error('Username/password are required');
        }
        const safeParse = tenant_user_dto_1.LoginDtoSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('Tenant user data validation failed', {
                details: safeParse.error.issues,
            });
            throw new Error('Tenant user data validation failed');
        }
        return safeParse.data;
    }
    async validatePasswordRequestData(data) {
        if (!data) {
            throw new Error('Username is required');
        }
        const safeParse = user_dto_1.RequestPasswordResetSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('Password reset request validation failed', {
                details: safeParse.error.issues,
            });
            throw new Error('Password reset request validation failed');
        }
        return safeParse.data;
    }
    async validateVerifyEmailData(data) {
        if (!data) {
            throw new Error('Email verification data is required');
        }
        const safeParse = auth_dto_1.VerifyEmailTokenSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('Email verification data validation failed', {
                details: safeParse.error.issues,
            });
            throw new Error('Email verification data validation failed');
        }
        return safeParse.data;
    }
    async validateChangePasswordData(data) {
        if (!data) {
            throw new Error('Password data is required');
        }
        const safeParse = user_dto_1.NewPasswordSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('New password data validation failed', {
                details: safeParse.error.issues,
            });
            throw new Error('New password data validation failed');
        }
        return safeParse.data;
    }
    async validateTenantUser(data) {
        try {
            const user = await prisma_config_1.default.user.findFirst({
                where: {
                    OR: [{ username: data.username }, { email: data.username }],
                },
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
                logger_1.logger.w('Tenant user not found', { username: data.username });
                throw new Error('Tenant user not found');
            }
            const isMatch = await bcrypt_1.default.compare(data.password, user.password);
            if (!isMatch) {
                logger_1.logger.w('Invalid password for tenant user', {
                    username: data.username,
                });
                throw new Error('Invalid password');
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
    async sendPasswordResetEmail(data) {
        try {
            const user = await prisma_config_1.default.user.findFirst({
                where: {
                    OR: [{ username: data.username }, { email: data.username }],
                },
            });
            if (!user) {
                logger_1.logger.w('Tenant user not found for password reset', {
                    username: data.username,
                });
                throw new Error('Tenant user not found');
            }
            if (!user.email) {
                logger_1.logger.w('User has no email address for password reset', {
                    username: data.username,
                });
                throw new Error('User has no email address');
            }
            await prisma_config_1.default.emailTokens.updateMany({
                where: { email: user.email, expired: false },
                data: { expired: true },
            });
            const resetToken = generator_service_1.default.generateVerificationCode();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
            await prisma_config_1.default.emailTokens.create({
                data: {
                    email: user.email,
                    token: resetToken,
                    expiresAt,
                },
            });
            await email_service_1.emailService.sendPasswordResetEmail(resetToken, user.email);
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to send password reset email', {
                username: data.username,
            });
            throw error;
        }
    }
    async verifyEmailToken(data) {
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
                logger_1.logger.w('Invalid or expired email verification token', {
                    email: data.email,
                });
                throw new Error('Invalid or expired token');
            }
            await prisma_config_1.default.emailTokens.updateMany({
                where: { email: data.email, token: data.token },
                data: { expired: true, verified: true },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to verify email token', {
                token: data.token,
                email: data.email,
            });
            throw error;
        }
    }
    async changePassword(data) {
        try {
            const existingUser = await prisma_config_1.default.user.findUnique({
                where: { email: data.email },
            });
            if (!existingUser) {
                logger_1.logger.w(`Tenant user not found (Email: ${data.email})`);
                throw new Error('Tenant user not found');
            }
            const isSamePassword = await bcrypt_1.default.compare(data.password, existingUser.password);
            if (isSamePassword) {
                logger_1.logger.w(`New password cannot be the same as the old password`, {
                    email: data.email,
                });
                throw new Error('New password cannot be the same as the old password');
            }
            const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
            await prisma_config_1.default.user.update({
                where: { email: data.email },
                data: { password: hashedPassword },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error changing tenant user password', {
                email: data.email,
            });
            throw error;
        }
    }
}
exports.tenantUserService = new TenantUserService();
