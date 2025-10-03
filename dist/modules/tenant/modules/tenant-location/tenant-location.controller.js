"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../../../config/logger");
const tenant_repository_1 = require("../../../../repository/tenant.repository");
const tenant_location_service_1 = require("./tenant-location.service");
const tenant_location_dto_1 = require("./tenant-location.dto");
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const initializeTenantLocations = async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    if (!id) {
        logger_1.logger.w('Country ID is missing');
        return res.status(400).json({ message: 'Country ID is required' });
    }
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        const country = await prisma_config_1.default.country.findUnique({
            where: { id },
        });
        if (!country) {
            logger_1.logger.w('Country not found', { countryId: id });
            return res.status(404).json({ message: 'Country not found' });
        }
        if (!req.user) {
            logger_1.logger.w('User information is missing');
            return res.status(400).json({ message: 'User information is required' });
        }
        const locations = await tenant_location_service_1.tenantLocationService.initializeTenantLocations(country, tenant);
        return res.status(200).json({
            message: 'Tenant locations initialized successfully',
            locations,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to initialize tenant locations', {
            tenantId,
            tenantCode,
        });
        return res
            .status(500)
            .json({ error: 'Failed to initialize tenant locations' });
    }
};
const getAllLocations = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ error: 'Tenant not found' });
        }
        const locations = await tenant_location_service_1.tenantLocationService.getAllLocations(tenant);
        return res.status(200).json(locations);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get tenant locations', { tenantId });
        return res.status(500).json({ error: 'Failed to get tenant locations' });
    }
};
const addTenantLocation = async (req, res) => {
    const { data } = req.body;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    if (!data) {
        logger_1.logger.w('Tenant data is missing');
        return res.status(400).json({ message: 'Tenant data is required' });
    }
    const parseResult = tenant_location_dto_1.TenantLocationSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid user data',
            details: parseResult.error.issues,
        });
    }
    const locationDto = parseResult.data;
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        await tenant_location_service_1.tenantLocationService.addLocation(locationDto, tenant);
        const locations = await tenant_location_service_1.tenantLocationService.getAllLocations(tenant);
        return res
            .status(200)
            .json({ message: 'Location added successfully', locations });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to add tenant location', { tenantId, tenantCode });
        return res.status(500).json({ error: 'Failed to add tenant location' });
    }
};
const updateTenantLocation = async (req, res) => {
    const { data } = req.body;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    if (!data) {
        logger_1.logger.w('Tenant data is missing');
        return res.status(400).json({ message: 'Tenant data is required' });
    }
    if (!userId) {
        logger_1.logger.w('User ID is missing');
        return res.status(400).json({ message: 'User ID is required' });
    }
    const parseResult = tenant_location_dto_1.TenantLocationSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid user data',
            details: parseResult.error.issues,
        });
    }
    const locationDto = parseResult.data;
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        await tenant_location_service_1.tenantLocationService.updateLocation(locationDto, tenant, userId);
        const locations = await tenant_location_service_1.tenantLocationService.getAllLocations(tenant);
        return res
            .status(200)
            .json({ message: 'Location updated successfully', locations });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update tenant location', {
            tenantId,
            tenantCode,
        });
        return res.status(500).json({ error: 'Failed to update tenant location' });
    }
};
const deleteTenantLocation = async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    if (!id) {
        logger_1.logger.w('Location ID is missing');
        return res.status(400).json({ message: 'Location ID is required' });
    }
    if (!userId) {
        logger_1.logger.w('User ID is missing');
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        await tenant_location_service_1.tenantLocationService.deleteLocation(id, tenant, userId);
        const locations = await tenant_location_service_1.tenantLocationService.getAllLocations(tenant);
        return res
            .status(200)
            .json({ message: 'Location deleted successfully', locations });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete tenant location', {
            tenantId,
            tenantCode,
        });
        return res.status(500).json({ error: 'Failed to delete tenant location' });
    }
};
exports.default = {
    initializeTenantLocations,
    getAllLocations,
    addTenantLocation,
    updateTenantLocation,
    deleteTenantLocation,
};
