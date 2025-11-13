"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerViolationService = void 0;
const prisma_config_1 = __importDefault(require("../../../config/prisma.config"));
const logger_1 = require("../../../config/logger");
const customer_violation_dto_1 = require("./customer-violation.dto");
class CustomerViolationService {
    async validateCustomerViolationData(data) {
        if (!data) {
            logger_1.logger.e('Invalid customer violation data', 'Customer violation validation failed');
        }
        const safeParse = customer_violation_dto_1.CustomerViolationSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('Invalid customer violation data', {
                errors: safeParse.error.issues,
                input: data,
            });
            throw new Error('Invalid customer violation data');
        }
        return safeParse.data;
    }
    async getCustomerViolations(tenant) {
        try {
            const violations = await prisma_config_1.default.customerViolation.findMany({
                where: { tenantId: tenant.id, isDeleted: false },
                include: {
                    violation: true,
                    customer: { select: { id: true, firstName: true, lastName: true } },
                },
            });
            return violations;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching customer violations', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw error;
        }
    }
    async getCustomerViolationById(violationId, tenant) {
        try {
            const violation = await prisma_config_1.default.customerViolation.findFirst({
                where: { id: violationId, tenantId: tenant.id, isDeleted: false },
                include: {
                    violation: true,
                    customer: { select: { id: true, firstName: true, lastName: true } },
                },
            });
            return violation;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching customer violation by ID', {
                violationId,
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw error;
        }
    }
    async addCustomerViolation(data, tenant) {
        try {
            const violations = await prisma_config_1.default.$transaction(async (tx) => {
                const customer = await tx.customer.findUnique({
                    where: { id: data.customerId, tenantId: tenant.id },
                });
                if (!customer) {
                    throw new Error('Customer not found');
                }
                await tx.customerViolation.create({
                    data: {
                        id: data.id,
                        customerId: data.customerId,
                        tenantId: tenant.id,
                        violationId: data.violationId,
                        violationDate: data.violationDate,
                        notes: data.notes,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });
                return await tx.customerViolation.findMany({
                    where: { tenantId: tenant.id, isDeleted: false },
                    include: {
                        violation: true,
                        customer: { select: { id: true, firstName: true, lastName: true } },
                    },
                });
            });
            return violations;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error adding customer violation', {
                data,
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw error;
        }
    }
    async updateCustomerViolation(data, tenant) {
        try {
            const violations = await prisma_config_1.default.$transaction(async (tx) => {
                const customer = await tx.customer.findUnique({
                    where: { id: data.customerId, tenantId: tenant.id },
                });
                if (!customer) {
                    throw new Error('Customer not found');
                }
                const existingViolation = await tx.customerViolation.findUnique({
                    where: { id: data.id, tenantId: tenant.id },
                });
                if (!existingViolation) {
                    throw new Error('Customer violation not found');
                }
                await tx.customerViolation.update({
                    where: { id: data.id, tenantId: tenant.id },
                    data: {
                        violationId: data.violationId,
                        violationDate: data.violationDate,
                        notes: data.notes,
                        updatedAt: new Date(),
                    },
                });
                return await tx.customerViolation.findMany({
                    where: { tenantId: tenant.id, isDeleted: false },
                    include: {
                        violation: true,
                        customer: { select: { id: true, firstName: true, lastName: true } },
                    },
                });
            });
            return violations;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error updating customer violation', {
                data,
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw error;
        }
    }
    async deleteCustomerViolation(violationId, tenant) {
        try {
            const violations = await prisma_config_1.default.$transaction(async (tx) => {
                const existingViolation = await tx.customerViolation.findUnique({
                    where: { id: violationId, tenantId: tenant.id },
                });
                if (!existingViolation) {
                    throw new Error('Customer violation not found');
                }
                await tx.customerViolation.update({
                    where: { id: violationId, tenantId: tenant.id },
                    data: { isDeleted: true, updatedAt: new Date() },
                });
                return await tx.customerViolation.findMany({
                    where: { tenantId: tenant.id, isDeleted: false },
                    include: {
                        violation: true,
                        customer: { select: { id: true, firstName: true, lastName: true } },
                    },
                });
            });
            return violations;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error deleting customer violation', {
                violationId,
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw error;
        }
    }
}
exports.customerViolationService = new CustomerViolationService();
