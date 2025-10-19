"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoleService = void 0;
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const logger_1 = require("../../../../config/logger");
class UserRoleService {
    async getTenantRoles(tenant) {
        try {
            if (!tenant) {
                throw new Error('Tenant information is required to fetch roles');
            }
            const roles = await prisma_config_1.default.userRole.findMany({
                where: { tenantId: tenant.id, show: true, isDeleted: false },
                include: {
                    rolePermission: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });
            return roles;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching tenant roles', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
        }
    }
    async getRole(user) {
        try {
            if (!user) {
                throw new Error('User is required to fetch role');
            }
            if (!user.roleId) {
                throw new Error('User does not have a role assigned');
            }
            const role = await prisma_config_1.default.userRole.findUnique({
                where: { id: user.roleId },
                include: {
                    rolePermission: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });
            if (!role) {
                throw new Error('Role not found');
            }
            return role;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching user role', { userId: user.id });
        }
    }
    async createUserRole(data, tenant) {
        try {
            const existingRole = await prisma_config_1.default.userRole.findFirst({
                where: { name: data.name, tenantId: tenant.id },
            });
            if (existingRole) {
                logger_1.logger.i('Role with this name already exists', {
                    tenantId: existingRole.tenantId,
                    roleName: existingRole.name,
                });
                throw new Error('Role with this name already exists');
            }
            const role = await prisma_config_1.default.userRole.create({
                data: {
                    name: data.name,
                    description: data.description,
                    show: data.show,
                    tenantId: tenant.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            return role;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error creating role', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                roleName: data.name,
            });
            throw new Error('Error creating role');
        }
    }
    async updateUserRole(data, tenant, user) {
        try {
            if (!tenant) {
                throw new Error('Tenant information is required to update a role');
            }
            const role = await prisma_config_1.default.userRole.update({
                where: { id: data.id, tenantId: tenant.id },
                data: {
                    name: data.name,
                    description: data.description,
                    show: data.show,
                    tenantId: tenant.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    updatedBy: user.username,
                },
            });
            return role;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error creating role', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                roleName: name,
            });
            throw new Error('Error creating role');
        }
    }
    async deleteUserRole(roleId, tenant, user) {
        try {
            if (!tenant) {
                throw new Error('Tenant information is required to delete a role');
            }
            const existingRole = await prisma_config_1.default.userRole.findUnique({
                where: { id: roleId, tenantId: tenant.id },
            });
            if (!existingRole) {
                throw new Error('Role not found');
            }
            const existingUsers = await prisma_config_1.default.user.count({
                where: { roleId, tenantId: tenant.id },
            });
            if (existingUsers > 0) {
                throw new Error('Cannot delete role assigned to users');
            }
            await prisma_config_1.default.userRole.update({
                where: { id: roleId },
                data: {
                    isDeleted: true,
                    updatedAt: new Date(),
                    updatedBy: user.username,
                },
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error deleting role', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                roleId,
            });
            throw new Error('Error deleting role');
        }
    }
    async assignPermissionsToRole(roleId, permissions, tenant, user) {
        try {
            await prisma_config_1.default.$transaction(async (tx) => {
                const role = await tx.userRole.findUnique({
                    where: { id: roleId, tenantId: tenant.id },
                });
                if (!role) {
                    throw new Error('Role not found');
                }
                await tx.userRolePermission.createMany({
                    data: permissions.map((permId) => ({
                        roleId: role.id,
                        permissionId: permId,
                        assignedBy: user.username,
                        assignedAt: new Date(),
                    })),
                    skipDuplicates: true,
                });
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error assigning permissions to role', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                roleId,
            });
            throw new Error('Error assigning permissions to role');
        }
    }
    async assignAllPermissions(role, tx) {
        try {
            if (!role) {
                throw new Error('Role  is required to assign permissions');
            }
            const permissions = await tx.appPermission.findMany({
                include: { category: true },
            });
            await tx.userRolePermission.createMany({
                data: permissions.map((perm) => ({
                    roleId: role.id,
                    permissionId: perm.id,
                })),
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error assigning permissions to role', { role });
            throw new Error('Error assigning permissions to role');
        }
    }
}
exports.userRoleService = new UserRoleService();
const getTenantRoles = async (tenant) => {
    try {
        if (!tenant) {
            throw new Error('Tenant information is required to fetch roles');
        }
        const roles = await prisma_config_1.default.userRole.findMany({
            where: { tenantId: tenant.id, show: true, isDeleted: false },
            include: {
                rolePermission: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        return roles;
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching tenant roles', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
    }
};
const deleteRole = async (role, tenant, tx) => {
    try {
        if (!role) {
            throw new Error('Role information is required to delete a role');
        }
        const existingUsers = await tx.user.count({
            where: { roleId: role.id, tenantId: tenant.id },
        });
        await tx.userRole.update({
            where: { id: role.id },
            data: { isDeleted: true },
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error deleting role', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            roleId: role.id,
            roleName: role.name,
        });
    }
};
const createSuperAdminRole = async (tenant, tx) => {
    try {
        if (!tenant) {
            throw new Error('Tenant information is required to create a role');
        }
        const role = await tx.userRole.create({
            data: {
                name: 'Super Admin',
                description: 'Super Admin role for new tenants',
                show: false,
                tenantId: tenant.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        return role;
    }
    catch (error) {
        logger_1.logger.e(error, 'Error creating role', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            roleName: name,
        });
        throw new Error('Error creating role');
    }
};
exports.default = {
    deleteRole,
    getTenantRoles,
    createSuperAdminRole,
};
