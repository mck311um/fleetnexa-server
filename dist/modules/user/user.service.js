"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
const generator_service_1 = __importDefault(require("../../services/generator.service"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const logger_1 = require("../../config/logger");
const uuid_1 = require("uuid");
const user_role_service_1 = require("./modules/user-role/user-role.service");
class UserService {
    constructor() {
        this.updateUser = async (data, tenant) => {
            try {
                const user = await prisma_config_1.default.user.update({
                    where: {
                        id: data.id,
                        tenantId: tenant.id,
                    },
                    data: {
                        email: data.email,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        profilePicture: data.profilePicture,
                    },
                    include: {
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
                const userData = {
                    id: user.id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    initials: `${user.firstName[0]}${user.lastName[0]}`,
                    fullName: `${user.firstName} ${user.lastName}`,
                    tenantId: user.tenantId,
                    createdAt: user.createdAt,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    roleId: user.roleId,
                    requirePasswordChange: user.requirePasswordChange,
                    role: user.role,
                };
                return userData;
            }
            catch (error) {
                logger_1.logger.e(error, 'Error creating user', {
                    tenantId: tenant.id,
                    tenantCode: tenant.tenantCode,
                });
                throw new Error('Error creating user');
            }
        };
    }
    async createUser(data, tenant) {
        try {
            const { user, password } = await prisma_config_1.default.$transaction(async (tx) => {
                const emailExists = await tx.user.findUnique({
                    where: {
                        email: data.email,
                        tenantId: tenant.id,
                    },
                });
                if (emailExists) {
                    throw new Error('User email already exists');
                }
                const username = await generator_service_1.default.generateUserName(data.firstName, data.lastName);
                const salt = await bcrypt_1.default.genSalt(10);
                let hashedPassword = '';
                let password = data.password;
                if (data.password) {
                    hashedPassword = await bcrypt_1.default.hash(data.password, salt);
                }
                else {
                    password = await generator_service_1.default.generateTempPassword(12);
                    hashedPassword = await bcrypt_1.default.hash(password, salt);
                }
                const user = await tx.user.create({
                    data: {
                        email: data.email,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        username,
                        password: hashedPassword,
                        tenantId: tenant.id,
                        requirePasswordChange: true,
                        roleId: data.roleId,
                        createdAt: new Date(),
                    },
                });
                return { user, password };
            });
            return { user, password };
        }
        catch (error) {
            logger_1.logger.e(error, 'Error creating user', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                email: data.email,
            });
            throw new Error('Error creating user');
        }
    }
    async createOwner(data, tenant) {
        try {
            const owner = {
                id: (0, uuid_1.v4)(),
                name: `Owner`,
                description: 'Owner role with full access',
                show: true,
            };
            return await prisma_config_1.default.$transaction(async (tx) => {
                const role = await user_role_service_1.userRoleService.createUserRole(owner, tenant);
                if (!role) {
                    throw new Error('Error creating owner role');
                }
                await user_role_service_1.userRoleService.assignAllPermissions(role, tx);
                data.roleId = role.id;
                const { user } = await this.createUser(data, tenant);
                return { user, role };
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error creating owner role', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Error creating owner role');
        }
    }
    async resetPassword(id, tenant) {
        try {
            const user = await prisma_config_1.default.user.findUnique({
                where: {
                    id,
                    tenantId: tenant.id,
                },
            });
            if (!user) {
                throw new Error('User not found');
            }
            const salt = await bcrypt_1.default.genSalt(10);
            const password = await generator_service_1.default.generateTempPassword(12);
            const hashedPassword = await bcrypt_1.default.hash(password, salt);
            const updatedUser = await prisma_config_1.default.user.update({
                where: {
                    id,
                    tenantId: tenant.id,
                },
                data: {
                    password: hashedPassword,
                },
            });
            return { updatedUser, password };
        }
        catch (error) {
            logger_1.logger.e(error, 'Error resetting password', {
                userId: id,
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Error resetting password');
        }
    }
    async getCurrentStorefrontUser(userId) {
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
}
exports.userService = new UserService();
const getCurrentUser = async (userId, tenant) => {
    try {
        const user = await prisma_config_1.default.user.findUnique({
            where: { id: userId, tenantId: tenant.id },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                tenantId: true,
                createdAt: true,
                email: true,
                roleId: true,
                profilePicture: true,
                requirePasswordChange: true,
                role: {
                    include: {
                        rolePermission: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
                tenant: {
                    select: {
                        tenantCode: true,
                        tenantName: true,
                    },
                },
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const userData = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            initials: `${user.firstName[0]}${user.lastName[0]}`,
            fullName: `${user.firstName} ${user.lastName}`,
            tenantId: user.tenantId,
            tenant: user.tenant?.tenantCode,
            tenantName: user.tenant?.tenantName,
            createdAt: user.createdAt,
            email: user.email,
            profilePicture: user.profilePicture || null,
            roleId: user.roleId,
            requirePasswordChange: user.requirePasswordChange,
            role: user.role,
        };
        return userData;
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching current user', {
            userId,
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        throw new Error('Error fetching current user');
    }
};
const getCurrentAdminUser = async (userId) => {
    try {
        const user = await prisma_config_1.default.adminUser.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                email: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const userData = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            initials: `${user.firstName[0]}${user.lastName[0]}`,
            fullName: `${user.firstName} ${user.lastName}`,
            createdAt: user.createdAt,
            email: user.email,
        };
        return userData;
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching current admin user', {
            userId,
        });
        throw new Error('Error fetching current admin user');
    }
};
const deleteUser = async (id, tenant, tx) => {
    try {
        const user = await tx.user.findUnique({
            where: {
                id,
                tenantId: tenant.id,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        await tx.user.update({
            where: {
                id,
                tenantId: tenant.id,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error deleting user', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            userId: id,
        });
        throw new Error('Error deleting user');
    }
};
const changePassword = async (data, tenant, userId) => {
    try {
        const user = await prisma_config_1.default.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const isMatch = await bcrypt_1.default.compare(data.currentPassword, user.password);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(data.newPassword, salt);
        await prisma_config_1.default.user.update({
            where: {
                id: userId,
                tenantId: tenant.id,
            },
            data: {
                password: hashedPassword,
                requirePasswordChange: false,
            },
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error changing password', {
            userId: tenant.id,
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
    }
};
exports.default = {
    deleteUser,
    getCurrentUser,
    changePassword,
    getCurrentAdminUser,
};
