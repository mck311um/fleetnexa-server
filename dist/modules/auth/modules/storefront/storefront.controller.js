"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storefront_service_1 = require("./storefront.service");
const logger_1 = require("../../../../config/logger");
const auth_dto_1 = require("../../auth.dto");
const createUser = async (req, res) => {
    const data = req.body;
    const userDto = await storefront_service_1.storefrontAuthService.validateUserData(data);
    try {
        const newUser = await storefront_service_1.storefrontAuthService.createUser(userDto);
        res.status(201).json(newUser);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error creating storefront user', {
            email: userDto.email,
        });
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
const loginUser = async (req, res) => {
    const data = req.body;
    if (!data) {
        logger_1.logger.w('Email/password are required');
        return res.status(400).json({ error: 'Email/password are required' });
    }
    const parseResult = auth_dto_1.LoginDtoSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Email/password validation failed',
            details: parseResult.error.issues,
        });
    }
    const userDto = parseResult.data;
    try {
        const result = await storefront_service_1.storefrontAuthService.validateUser(userDto);
        res.status(200).json(result);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error during storefront user login', {
            email: userDto.username,
        });
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
const requestPasswordReset = async (req, res) => {
    const data = req.body;
    if (!data.email) {
        logger_1.logger.w('Email is required for password reset');
        return res.status(400).json({ error: 'Email is required' });
    }
    try {
        await storefront_service_1.storefrontAuthService.requestPasswordReset(data.email);
        res
            .status(200)
            .json({ message: 'Password reset instructions sent to email' });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error requesting storefront password reset', {
            email: data.email,
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
const verifyPasswordResetToken = async (req, res) => {
    const data = req.body;
    if (!data) {
        logger_1.logger.w('Email and token are required');
        return res.status(400).json({ error: 'Email and token are required' });
    }
    const parseResult = auth_dto_1.VerifyEmailTokenSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Email/token validation failed',
            details: parseResult.error.issues,
        });
    }
    const tokenDto = parseResult.data;
    try {
        await storefront_service_1.storefrontAuthService.verifyPasswordResetToken(tokenDto);
        res.status(200).json({ message: 'Token verified successfully' });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error verifying storefront password reset token', {
            email: data.email,
        });
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
const resetPassword = async (req, res) => {
    const data = req.body;
    const parseResult = auth_dto_1.ResetPasswordDtoSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Password reset validation failed',
            details: parseResult.error.issues,
        });
    }
    const resetDto = parseResult.data;
    try {
        await storefront_service_1.storefrontAuthService.resetPassword(resetDto);
        res.status(200).json({ message: 'Password reset successfully' });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error resetting storefront password', {
            email: resetDto.email,
        });
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
exports.default = {
    createUser,
    loginUser,
    requestPasswordReset,
    verifyPasswordResetToken,
    resetPassword,
};
