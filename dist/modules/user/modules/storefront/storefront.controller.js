"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storefront_service_1 = require("./storefront.service");
const logger_1 = require("../../../../config/logger");
const updateStorefrontUser = async (req, res) => {
    const body = req.body;
    const { storefrontUser } = req.context;
    const userDto = await storefront_service_1.storefrontUserService.validateUserData(body);
    try {
        const updatedUser = await storefront_service_1.storefrontUserService.updateStorefrontUser(userDto, storefrontUser);
        return res.status(200).json({
            message: 'Account updated successfully',
            user: updatedUser,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error updating storefront user', {
            storefrontUserId: storefrontUser.id,
        });
        res.status(500).json({ message: error.message });
    }
};
const getCurrentUser = async (req, res) => {
    const storefrontUserId = req.storefrontUser?.id;
    if (!storefrontUserId) {
        logger_1.logger.w('Storefront User ID is missing', { storefrontUserId });
        return res.status(400).json({ error: 'Storefront User ID is required' });
    }
    try {
        const storefrontUser = await storefront_service_1.storefrontUserService.getCurrentUser(storefrontUserId);
        res.status(200).json(storefrontUser);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching storefront user', { storefrontUserId });
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const changePassword = async (req, res) => {
    const body = req.body;
    const { storefrontUser } = req.context;
    const userDto = await storefront_service_1.storefrontUserService.validatePasswordData(body);
    try {
        await storefront_service_1.storefrontUserService.updatePassword(userDto, storefrontUser);
        res.status(200).json({ message: 'Password Changed Successfully' });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error updating storefront user password', {
            storefrontUserId: storefrontUser.id,
        });
        res.status(500).json({ message: error.message });
    }
};
const getPreviousBookings = async (req, res) => {
    const { storefrontUser } = req.context;
    try {
        const bookings = await storefront_service_1.storefrontUserService.getPreviousBookings(storefrontUser);
        res.status(200).json({ bookings });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching previous bookings', {
            storefrontUserId: storefrontUser.id,
        });
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};
exports.default = {
    getCurrentUser,
    updateStorefrontUser,
    changePassword,
    getPreviousBookings,
};
