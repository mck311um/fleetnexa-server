"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("./user.service"));
const logger_1 = require("../../config/logger");
const tenant_repository_1 = require("../../repository/tenant.repository");
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
const email_service_1 = __importDefault(require("../email/email.service"));
const user_repository_1 = require("./user.repository");
const user_dto_1 = require("./user.dto");
const getCurrentUser = async (req, res) => {
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!userId) {
        logger_1.logger.w('User ID is missing', { userId });
        return res.status(400).json({ error: 'User ID is required' });
    }
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantId });
            return res.status(404).json({ error: 'Tenant not found' });
        }
        const user = await user_service_1.default.getCurrentUser(userId, tenant);
        res.status(200).json(user);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching current user', {
            userId,
            tenantId,
            tenantCode,
        });
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const getSystemUsers = async (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    try {
        const users = await user_repository_1.userRepo.getUsers(tenantId);
        res.status(200).json(users);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching users', { tenantId });
        res.status(500).json({ message: 'Internal server error' });
    }
};
const createSystemUser = async (req, res) => {
    const { data } = req.body;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!data) {
        logger_1.logger.w('User data is missing', { tenantId });
        return res.status(400).json({ error: 'User data is required' });
    }
    const parseResult = user_dto_1.CreateUserSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid user data',
            details: parseResult.error.issues,
        });
    }
    const userDto = parseResult.data;
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            // const tenant = await tenantRepo.getTenantById(tenantId);
            // if (!tenant) {
            //   logger.w('Tenant not found', { tenantId });
            //   return res.status(404).json({ error: 'Tenant not found' });
            // }
            // const { user, password } = await service.createUser(userDto, tenant, tx);
            // await emailService.newUserEmail(tenant, user.id, password, tx);
        });
        res.status(201).json({ message: 'User created successfully' });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error creating user', { tenantId, userId, tenantCode });
        res.status(500).json({ message: 'Error creating user' });
    }
};
const updateSystemUser = async (req, res) => {
    const { data } = req.body;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!data) {
        logger_1.logger.w('User data is missing', { tenantId });
        return res.status(400).json({ error: 'User data is required' });
    }
    const parseResult = user_dto_1.UpdateUserSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid user data',
            details: parseResult.error.issues,
        });
    }
    const userDto = parseResult.data;
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantId });
            return res.status(404).json({ error: 'Tenant not found' });
        }
        const user = await user_service_1.default.updateUser(userDto, tenant, userId);
        res.status(201).json({
            message: 'User updated successfully',
            user,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error updating user', { tenantId, userId, tenantCode });
        res.status(500).json({ error: 'Internal server error' });
    }
};
const changePassword = async (req, res) => {
    const { data } = req.body;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!data) {
        logger_1.logger.w('User data is missing', { tenantId });
        return res.status(400).json({ error: 'User data is required' });
    }
    const parseResult = user_dto_1.ChangePasswordSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid password data',
            details: parseResult.error.issues,
        });
    }
    const userDto = parseResult.data;
    try {
        const user = await prisma_config_1.default.$transaction(async (tx) => {
            const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
            if (!tenant) {
                logger_1.logger.w('Tenant not found', { tenantId });
                return res.status(404).json({ error: 'Tenant not found' });
            }
            await user_service_1.default.changePassword(userDto, tenant, userId);
            return await user_service_1.default.getCurrentUser(userId, tenant);
        });
        res.status(200).json({ user, message: 'Password updated successfully' });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching current user', {
            userId,
            tenantId,
            tenantCode,
        });
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const resetUserPassword = async (req, res) => {
    const { id } = req.params;
    const tenantId = 'f7150cc7-7be7-4b83-9e47-98e1b13034f9';
    const tenantCode = req.user?.tenantCode;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!id) {
        logger_1.logger.w('User ID is missing', { tenantId });
        return res.status(400).json({ error: 'User ID is required' });
    }
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
            if (!tenant) {
                logger_1.logger.w('Tenant not found', { tenantId });
                return res.status(404).json({ error: 'Tenant not found' });
            }
            const { updatedUser, password } = await user_service_1.default.resetPassword(id, tenant, tx);
            await email_service_1.default.resetPasswordEmail(tenant, updatedUser.id, password, tx);
        });
        res.status(200).json({ message: 'User password reset successfully' });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error resetting user password', {
            tenantId,
            userId,
            tenantCode,
        });
        res.status(500).json({ error: 'Internal server error' });
    }
};
const deleteUser = async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!id) {
        logger_1.logger.w('Customer ID is missing', { tenantId });
        return res.status(400).json({ error: 'Customer ID is required' });
    }
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
            if (!tenant) {
                logger_1.logger.w('Tenant not found', { tenantId });
                return res.status(404).json({ error: 'Tenant not found' });
            }
            await user_service_1.default.deleteUser(id, tenant, tx);
        });
        const users = await user_repository_1.userRepo.getUsers(tenantId);
        res.status(200).json({
            users,
            message: 'User deleted successfully',
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error deleting user', { tenantId, userId, tenantCode });
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.default = {
    getCurrentUser,
    getSystemUsers,
    deleteUser,
    createSystemUser,
    updateSystemUser,
    changePassword,
    resetUserPassword,
};
