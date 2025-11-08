"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_user_service_1 = require("./tenant-user.service");
const logger_1 = require("../../../../config/logger");
const requestPassword = async (req, res) => {
    const data = req.body;
    const userDto = await tenant_user_service_1.tenantUserService.validatePasswordRequestData(data);
    try {
        await tenant_user_service_1.tenantUserService.sendPasswordResetEmail(userDto);
        res.status(200).json({ message: 'Password reset email sent' });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error requesting tenant user password reset', {
            username: userDto.username,
        });
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
const verifyEmailToken = async (req, res) => {
    const data = req.body;
    const userDto = await tenant_user_service_1.tenantUserService.validateVerifyEmailData(data);
    try {
        await tenant_user_service_1.tenantUserService.verifyEmailToken(userDto);
        res.status(200).json({ message: 'Email verified successfully' });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error verifying tenant user email token', {
            email: userDto.email,
        });
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
const changePassword = async (req, res) => {
    const data = req.body;
    const userDto = await tenant_user_service_1.tenantUserService.validateChangePasswordData(data);
    try {
        await tenant_user_service_1.tenantUserService.changePassword(userDto);
        res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error changing tenant user password', {
            email: userDto.email,
        });
        res.status(500).json({ message: error.message });
    }
};
exports.default = {
    requestPassword,
    verifyEmailToken,
    changePassword,
};
