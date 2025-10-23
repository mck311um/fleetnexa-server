"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerService = void 0;
const logger_1 = require("../../config/logger");
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
const customer_repository_1 = require("./customer.repository");
class CustomerService {
    async getTenantCustomers(tenant) {
        try {
            const customers = customer_repository_1.customerRepo.getCustomers(tenant.id);
            return customers;
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to get customers', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Failed to get customers');
        }
    }
}
exports.customerService = new CustomerService();
const getPrimaryDriver = async (bookingId) => {
    try {
        const driver = await prisma_config_1.default.rentalDriver.findFirst({
            where: {
                rentalId: bookingId,
                isPrimary: true,
            },
            include: {
                customer: {
                    include: {
                        address: {
                            include: {
                                country: true,
                                state: true,
                                village: true,
                            },
                        },
                    },
                },
            },
        });
        if (!driver) {
            throw new Error('Primary driver not found');
        }
        return driver;
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching primary driver', { bookingId });
        throw error;
    }
};
const addCustomerViolation = async (data, tenant) => {
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
    }
};
const updateCustomerViolation = async (data, tenant) => {
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
    }
};
const deleteCustomerViolation = async (violationId, tenant) => {
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
    }
};
exports.default = {
    getPrimaryDriver,
    addCustomerViolation,
    updateCustomerViolation,
    deleteCustomerViolation,
};
