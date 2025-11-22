"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_config_1 = __importDefault(require("../../../config/prisma.config"));
const logger_1 = require("../../../config/logger");
const customer_violation_service_1 = require("./customer-violation.service");
const customer_repository_1 = require("../customer.repository");
const getCustomerViolations = async (req, res) => {
    const { tenant } = req.context;
    try {
        const violations = await customer_violation_service_1.customerViolationService.getCustomerViolations(tenant);
        return res.status(200).json({ violations });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to fetch customer violations', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res
            .status(500)
            .json({ message: 'Failed to fetch customer violations' });
    }
};
const getCustomerViolationById = async (req, res) => {
    const { id } = req.params;
    const { tenant } = req.context;
    if (!id) {
        return res
            .status(400)
            .json({ message: 'Customer violation ID is required' });
    }
    try {
        const violation = await customer_violation_service_1.customerViolationService.getCustomerViolationById(id, tenant);
        return res.status(200).json({ violation });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to fetch customer violation', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res
            .status(500)
            .json({ message: error.message || 'Failed to fetch customer violation' });
    }
};
const addCustomerViolation = async (req, res) => {
    const data = req.body;
    const { tenant } = req.context;
    const violationDto = await customer_violation_service_1.customerViolationService.validateCustomerViolationData(data);
    try {
        await customer_violation_service_1.customerViolationService.addCustomerViolation(violationDto, tenant);
        const violations = await prisma_config_1.default.customerViolation.findMany({
            where: { tenantId: tenant.id, isDeleted: false },
            include: {
                violation: true,
                customer: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        const customer = await customer_repository_1.customerRepo.getCustomerById(violationDto.customerId, tenant.id);
        return res.status(201).json({
            message: 'Customer violation added successfully',
            violations,
            customer,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to add customer violation', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res
            .status(500)
            .json({ message: error.message || 'Failed to add customer violation' });
    }
};
const updateCustomerViolation = async (req, res) => {
    const data = req.body;
    const { tenant } = req.context;
    const violationDto = await customer_violation_service_1.customerViolationService.validateCustomerViolationData(data);
    try {
        const violations = await customer_violation_service_1.customerViolationService.updateCustomerViolation(violationDto, tenant);
        const customer = await customer_repository_1.customerRepo.getCustomerById(violationDto.customerId, tenant.id);
        return res.status(200).json({
            message: 'Customer violation updated successfully',
            violations,
            customer,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update customer violation', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res.status(500).json({
            message: error.message || 'Failed to update customer violation',
        });
    }
};
const deleteCustomerViolation = async (req, res) => {
    const { id } = req.params;
    const { tenant } = req.context;
    if (!id) {
        logger_1.logger.w('Customer violation ID is missing', {
            tenantCode: tenant.tenantCode,
            tenantId: tenant.id,
        });
        return res
            .status(400)
            .json({ message: 'Customer violation ID is required' });
    }
    try {
        const violations = await customer_violation_service_1.customerViolationService.deleteCustomerViolation(id, tenant);
        return res
            .status(200)
            .json({ message: 'Customer violation deleted successfully', violations });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete customer violation', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res
            .status(500)
            .json({
            message: error.message || 'Failed to delete customer violation',
        });
    }
};
exports.default = {
    getCustomerViolations,
    getCustomerViolationById,
    addCustomerViolation,
    updateCustomerViolation,
    deleteCustomerViolation,
};
