"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const logger_1 = require("../../config/logger");
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
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
}
exports.authService = new AuthService();
