"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../../../config/logger");
const user_role_service_1 = require("./user-role.service");
const role_dto_1 = require("./role.dto");
const user_repository_1 = require("../../user.repository");
const getRoles = async (req, res) => {
    const { tenant } = req.context;
    try {
        const roles = await user_role_service_1.userRoleService.getTenantRoles(tenant);
        res.status(200).json({ message: 'Roles fetched successfully', roles });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching tenant', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res.status(500).json({ message: 'Internal server error' });
    }
};
const getUserRole = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        logger_1.logger.w('User ID is missing in request');
        return res.status(400).json({ error: 'User ID is required' });
    }
    try {
        const user = await user_repository_1.userRepo.getUserById(userId);
        if (!user) {
            logger_1.logger.w('User not found', { userId });
            return res.status(404).json({ message: 'User not found' });
        }
        const role = await user_role_service_1.userRoleService.getRole(user);
        res.status(200).json({ message: 'User role fetched successfully', role });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching user role', { userId });
        return res.status(500).json({ message: 'Internal server error' });
    }
};
const addUserRole = async (req, res) => {
    const { data } = req.body;
    const { tenant, user } = req.context;
    if (!data) {
        logger_1.logger.w('Tenant extra data is missing');
        return res.status(400).json({ message: 'Tenant extra data is required' });
    }
    const parseResult = role_dto_1.UserRoleSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid user data',
            details: parseResult.error.issues,
        });
    }
    const userDto = parseResult.data;
    try {
        await user_role_service_1.userRoleService.createUserRole(userDto, tenant, user);
        const roles = await user_role_service_1.userRoleService.getTenantRoles(tenant);
        return res.status(200).json({
            message: 'Role added successfully',
            roles,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to add user role', {
            tenantId: tenant.id,
            userId: user.id,
            data: userDto,
        });
        return res.status(500).json({
            message: error?.response?.data?.message || 'Failed to add user role',
        });
    }
};
const updateRole = async (req, res) => {
    const { data } = req.body;
    const { tenant, user } = req.context;
    if (!data) {
        logger_1.logger.w('Role data is missing');
        return res.status(400).json({ message: 'Role data is required' });
    }
    const parseResult = role_dto_1.UserRoleSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid role data',
            details: parseResult.error.issues,
        });
    }
    const roleDto = parseResult.data;
    try {
        await user_role_service_1.userRoleService.updateUserRole(roleDto, tenant, user);
        const roles = await user_role_service_1.userRoleService.getTenantRoles(tenant);
        return res.status(200).json({
            message: 'Role updated successfully',
            roles,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update user role', {
            tenantId: tenant.id,
            userId: user.id,
            data: roleDto,
        });
        return res.status(500).json({ message: 'Failed to update user role' });
    }
};
const deleteRole = async (req, res) => {
    const { id } = req.params;
    const { tenant, user } = req.context;
    if (!id) {
        logger_1.logger.w('Role ID is missing in request', { id });
        return res.status(400).json({ error: 'Role ID is required' });
    }
    try {
        await user_role_service_1.userRoleService.deleteUserRole(id, tenant, user);
        const roles = await user_role_service_1.userRoleService.getTenantRoles(tenant);
        res.status(200).json({ message: 'Role deleted successfully', roles });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error deleting role', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            roleId: id,
        });
        return res.status(500).json({ message: 'Internal server error' });
    }
};
const assignPermissions = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    const { tenant, user } = req.context;
    if (!id) {
        logger_1.logger.w('Role ID is missing in request', { id });
        return res.status(400).json({ error: 'Role ID is required' });
    }
    if (!data) {
        logger_1.logger.w('Permissions data is missing');
        return res.status(400).json({ message: 'Permissions data is required' });
    }
    try {
        await user_role_service_1.userRoleService.assignPermissionsToRole(id, data, tenant, user);
        const roles = await user_role_service_1.userRoleService.getTenantRoles(tenant);
        return res
            .status(200)
            .json({ message: 'Permissions assigned successfully', roles });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error assigning permissions to role', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            roleId: id,
        });
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.default = {
    getRoles,
    getUserRole,
    deleteRole,
    addUserRole,
    updateRole,
    assignPermissions,
};
