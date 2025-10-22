"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storefront_service_1 = require("./storefront.service");
const logger_1 = require("../../config/logger");
const getTenants = async (req, res) => {
    try {
        const tenants = await storefront_service_1.storefrontService.getTenants();
        res.status(200).json({ tenants });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching tenants for storefront');
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const getTenantBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const tenant = await storefront_service_1.storefrontService.getTenantBySlug(slug);
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        res.status(200).json(tenant);
    }
    catch (error) {
        logger_1.logger.e(error, `Error fetching tenant with slug: ${slug}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const getVehicles = async (req, res) => {
    try {
        const vehicles = await storefront_service_1.storefrontService.getVehicles();
        res.status(200).json(vehicles);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching vehicles for storefront');
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const getVehicleById = async (req, res) => {
    const { id } = req.params;
    try {
        const vehicle = await storefront_service_1.storefrontService.getVehicleById(id);
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.status(200).json(vehicle);
    }
    catch (error) {
        logger_1.logger.e(error, `Error fetching vehicle with id: ${id}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.default = {
    getTenants,
    getTenantBySlug,
    getVehicles,
    getVehicleById,
};
