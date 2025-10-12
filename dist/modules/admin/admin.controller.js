"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../config/logger");
const admin_service_1 = require("./admin.service");
const getAdminData = async (req, res) => {
    try {
        const data = await admin_service_1.adminService.getAdminData();
        res.status(200).json(data);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching admin data');
        res.status(500).json({ message: 'Internal server error' });
    }
};
const dashboardAdminData = async (req, res) => {
    try {
        const data = await admin_service_1.adminService.getDashboardAdminData();
        res.status(200).json(data);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching dashboard admin data');
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.default = {
    getAdminData,
    dashboardAdminData,
};
