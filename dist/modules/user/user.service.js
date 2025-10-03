"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
const generator_service_1 = __importDefault(require("../../services/generator.service"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const logger_1 = require("../../config/logger");
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
const createUser = async (data, tenant, tx, user) => {
    try {
        const emailExists = await tx.user.findUnique({
            where: {
                email: data.email,
            },
        });
        if (emailExists) {
            throw new Error('Email already exists');
        }
        const username = await generator_service_1.default.generateUserName(data.firstName, data.lastName);
        const salt = await bcrypt_1.default.genSalt(10);
        const password = await generator_service_1.default.generateTempPassword(12);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
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
            },
        });
        return { user, password };
    }
    catch (error) {
        logger_1.logger.e(error, 'Error creating user', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        throw new Error('Error creating user');
    }
};
const createOwner = async (data, tenant, tx) => {
    try {
        // const owner: CreateRoleDto = {
        //   name: 'Owner',
        //   description: 'Owner role with full access',
        //   show: true,
        // };
        // const role = await userRoleService.createUserRole(owner, tenant, user);
        // if (!role) {
        //   throw new Error('Error creating owner role');
        // }
        // await roleService.assignAllPermissions(role, tx);
        // data.roleId = role.id;
        // const { user, password } = await createUser(data, tenant, tx);
        // return { user, password, role };
    }
    catch (error) {
        logger_1.logger.e(error, 'Error creating owner role', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        throw new Error('Error creating owner role');
    }
};
const updateUser = async (data, tenant, userId) => {
    try {
        const username = await generator_service_1.default.generateUserName(data.firstName, data.lastName);
        const user = await prisma_config_1.default.user.update({
            where: {
                id: userId,
                tenantId: tenant.id,
            },
            data: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                profilePicture: data.profilePicture,
                username,
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
const resetPassword = async (id, tenant, tx) => {
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
        const salt = await bcrypt_1.default.genSalt(10);
        const password = await generator_service_1.default.generateTempPassword(12);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const updatedUser = await tx.user.update({
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
};
exports.default = {
    createUser,
    createOwner,
    updateUser,
    deleteUser,
    getCurrentUser,
    changePassword,
    resetPassword,
};
