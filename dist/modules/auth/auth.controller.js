"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../config/logger");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./auth.dto");
const adminUserLogin = async (req, res) => {
    const data = req.body;
    if (!data) {
        logger_1.logger.w('Username/password are required');
        return res.status(400).json({ error: 'Username/password are required' });
    }
    const parseResult = auth_dto_1.LoginDtoSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Username/password validation failed',
            details: parseResult.error.issues,
        });
    }
    const userDto = parseResult.data;
    try {
        const result = await auth_service_1.authService.validateAdminUser(userDto);
        if (!result) {
            logger_1.logger.w('Invalid username or password', { username: userDto.username });
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error during admin user login', {
            username: userDto.username,
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
const tenantLogin = async (req, res) => {
    const data = req.body;
    if (!data) {
        logger_1.logger.w('Username/password are required');
        return res.status(400).json({ error: 'Username/password are required' });
    }
    const parseResult = auth_dto_1.LoginDtoSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Username/password validation failed',
            details: parseResult.error.issues,
        });
    }
    const userDto = parseResult.data;
    try {
        const result = await auth_service_1.authService.validateTenantUser(userDto);
        if (!result) {
            logger_1.logger.w('Invalid username or password', {
                username: userDto.username,
            });
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error during tenant user login', {
            username: userDto.username,
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
const createAdminUser = async (req, res) => {
    const data = req.body;
    const userDto = await auth_service_1.authService.validateAdminUserData(data);
    try {
        const newUser = await auth_service_1.authService.createAdminUser(userDto);
        res.status(201).json(newUser);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error creating admin user', {
            username: userDto.username,
        });
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
exports.default = {
    adminUserLogin,
    tenantLogin,
    createAdminUser,
};
