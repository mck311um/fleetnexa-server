"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storefront_service_1 = require("./storefront.service");
const logger_1 = require("../../config/logger");
const storefront_dto_1 = require("./storefront.dto");
const tenant_repository_1 = require("../../repository/tenant.repository");
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
const rateTenant = async (req, res) => {
    const data = req.body;
    if (!data) {
        logger_1.logger.e('No data provided for rating tenant');
        return res.status(400).json({ error: 'Bad Request: No data provided' });
    }
    const parseResult = storefront_dto_1.StorefrontRatingSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid rating data',
            details: parseResult.error.issues,
        });
    }
    const ratingDto = parseResult.data;
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(ratingDto.tenantId || '');
        if (!tenant) {
            logger_1.logger.e(`Tenant not found with id: ${ratingDto.tenantId}`);
            return res.status(404).json({ error: 'Tenant not found' });
        }
        await storefront_service_1.storefrontService.rateTenant(ratingDto, tenant);
        res.status(201).json({ message: 'Rating submitted successfully' });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error saving tenant rating');
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const rateSite = async (req, res) => {
    const data = req.body;
    if (!data) {
        logger_1.logger.e('No data provided for site rating');
        return res.status(400).json({ error: 'Bad Request: No data provided' });
    }
    const parseResult = storefront_dto_1.StorefrontRatingSchema.omit({ tenantId: true }).safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid site rating data',
            details: parseResult.error.issues,
        });
    }
    const ratingDto = parseResult.data;
    try {
        await storefront_service_1.storefrontService.rateRentnexa(ratingDto);
        res.status(201).json({ message: 'Site rating submitted successfully' });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error saving site rating');
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.default = {
    getTenants,
    getTenantBySlug,
    getVehicles,
    getVehicleById,
    rateTenant,
    rateSite,
};
