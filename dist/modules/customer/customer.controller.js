"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
const logger_1 = require("../../config/logger");
const customer_dto_1 = require("./customer.dto");
const tenant_repository_1 = require("../../repository/tenant.repository");
const customer_service_1 = __importStar(require("./customer.service"));
const getCustomers = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        const customers = await customer_service_1.customerService.getTenantCustomers(tenant);
        return res.status(200).json(customers);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to fetch customers', {
            tenantId,
            tenantCode,
        });
        return res.status(500).json({ message: 'Failed to fetch customers' });
    }
};
const getCustomerViolations = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    try {
        const violations = await prisma_config_1.default.customerViolation.findMany({
            where: { tenantId, isDeleted: false },
            include: {
                violation: true,
                customer: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        return res.status(200).json({ violations });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to fetch customer violations', {
            tenantId,
            tenantCode,
        });
        return res
            .status(500)
            .json({ message: 'Failed to fetch customer violations' });
    }
};
const getCustomerViolationById = async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    if (!id) {
        return res
            .status(400)
            .json({ message: 'Customer violation ID is required' });
    }
    try {
        const violations = await prisma_config_1.default.customerViolation.findFirst({
            where: { customerId: id, tenantId, isDeleted: false },
            include: {
                violation: true,
                customer: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        return res.status(200).json({ violations });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to fetch customer violation', {
            tenantId,
            tenantCode,
        });
        return res
            .status(500)
            .json({ message: 'Failed to fetch customer violation' });
    }
};
const addCustomerViolation = async (req, res) => {
    const { data } = req.body;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    if (!data) {
        logger_1.logger.w('Customer violation data is missing', { tenantCode, tenantId });
        return res
            .status(400)
            .json({ message: 'Customer violation data is required' });
    }
    const parseResult = customer_dto_1.CustomerViolationSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid customer violation data',
            details: parseResult.error.issues,
        });
    }
    const violationDto = parseResult.data;
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        await customer_service_1.default.addCustomerViolation(violationDto, tenant);
        const violations = await prisma_config_1.default.customerViolation.findMany({
            where: { tenantId },
            include: {
                violation: true,
                customer: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        return res
            .status(201)
            .json({ message: 'Customer violation added successfully', violations });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to add customer violation', {
            tenantId,
            tenantCode,
        });
        return res
            .status(500)
            .json({ message: 'Failed to add customer violation' });
    }
};
const updateCustomerViolation = async (req, res) => {
    const { data } = req.body;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    if (!data) {
        logger_1.logger.w('Customer violation data is missing', { tenantCode, tenantId });
        return res
            .status(400)
            .json({ message: 'Customer violation data is required' });
    }
    const parseResult = customer_dto_1.CustomerViolationSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid customer violation data',
            details: parseResult.error.issues,
        });
    }
    const violationDto = parseResult.data;
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        const violations = await customer_service_1.default.updateCustomerViolation(violationDto, tenant);
        return res
            .status(200)
            .json({ message: 'Customer violation updated successfully', violations });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update customer violation', {
            tenantId,
            tenantCode,
        });
        return res
            .status(500)
            .json({ message: 'Failed to update customer violation' });
    }
};
const deleteCustomerViolation = async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    if (!id) {
        logger_1.logger.w('Customer violation ID is missing', { tenantCode, tenantId });
        return res
            .status(400)
            .json({ message: 'Customer violation ID is required' });
    }
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        const violations = await customer_service_1.default.deleteCustomerViolation(id, tenant);
        return res
            .status(200)
            .json({ message: 'Customer violation deleted successfully', violations });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete customer violation', {
            tenantId,
            tenantCode,
        });
        return res
            .status(500)
            .json({ message: 'Failed to delete customer violation' });
    }
};
exports.default = {
    getCustomerViolations,
    getCustomerViolationById,
    addCustomerViolation,
    updateCustomerViolation,
    deleteCustomerViolation,
};
