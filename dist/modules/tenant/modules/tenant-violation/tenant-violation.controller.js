"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../../../config/logger");
const tenant_repository_1 = require("../../../../repository/tenant.repository");
const tenant_violation_service_1 = require("./tenant-violation.service");
const tenant_violation_dto_1 = require("./tenant-violation.dto");
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const getAllTenantViolations = async (req, res) => {
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
        const violations = await tenant_violation_service_1.tenantViolationsService.getTenantViolations(tenant);
        return res.status(200).json(violations);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get tenant violations', {
            tenantId,
            tenantCode,
        });
        return res.status(500).json({ error: 'Failed to get tenant violations' });
    }
};
const createViolation = async (req, res) => {
    const { data } = req.body;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    if (!data) {
        logger_1.logger.w('Violation data is missing', { tenantCode, tenantId });
        return res.status(400).json({ message: 'Violation data is required' });
    }
    const parseResult = tenant_violation_dto_1.TenantViolationSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid user data',
            details: parseResult.error.issues,
        });
    }
    const violationDto = parseResult.data;
    try {
        const tenant = await prisma_config_1.default.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        const violations = await tenant_violation_service_1.tenantViolationsService.createViolation(violationDto, tenant);
        logger_1.logger.i('Violation(s) created successfully', { violations });
        return res
            .status(201)
            .json({ message: 'Violation created successfully', violations });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to create violation', {
            tenantCode,
            tenantId,
            violation: data.violation,
        });
        return res.status(500).json({ message: 'Failed to create violation' });
    }
};
const updateViolation = async (req, res) => {
    const { data } = req.body;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    if (!data) {
        logger_1.logger.w('Violation data is missing', { tenantCode, tenantId });
        return res.status(400).json({ message: 'Violation data is required' });
    }
    const parseResult = tenant_violation_dto_1.TenantViolationSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid user data',
            details: parseResult.error.issues,
        });
    }
    const violationDto = parseResult.data;
    try {
        const tenant = await prisma_config_1.default.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        const violations = await tenant_violation_service_1.tenantViolationsService.updateViolation(violationDto, tenant);
        return res
            .status(200)
            .json({ message: 'Violation updated successfully', violations });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update violation', {
            tenantCode,
            tenantId,
            violation: data.violation,
        });
        return res.status(500).json({ message: 'Failed to update violation' });
    }
};
const deleteViolation = async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    if (!id) {
        logger_1.logger.w('Violation ID is missing', { tenantCode, tenantId });
        return res.status(400).json({ message: 'Violation ID is required' });
    }
    try {
        const tenant = await prisma_config_1.default.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        const violations = await tenant_violation_service_1.tenantViolationsService.deleteViolation(id, tenant);
        return res
            .status(200)
            .json({ message: 'Violation deleted successfully', violations });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete violation', {
            tenantCode,
            tenantId,
            violationId: id,
        });
        return res.status(500).json({ message: 'Failed to delete violation' });
    }
};
exports.default = {
    getAllTenantViolations,
    createViolation,
    updateViolation,
    deleteViolation,
};
