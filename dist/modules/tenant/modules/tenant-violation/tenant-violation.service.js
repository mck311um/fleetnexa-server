"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantViolationsService = void 0;
const logger_1 = require("../../../../config/logger");
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
class TenantViolationsService {
    async getTenantViolations(tenant) {
        try {
            const violations = await prisma_config_1.default.tenantViolation.findMany({
                where: { tenantId: tenant.id, isDeleted: false },
            });
            return violations;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching tenant violations', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
        }
    }
    async createViolation(data, tenant) {
        try {
            const violations = await prisma_config_1.default.$transaction(async (tx) => {
                const existingViolation = await tx.tenantViolation.findFirst({
                    where: { tenantId: tenant.id, violation: data.violation },
                });
                if (existingViolation) {
                    throw new Error('Violation with this name already exists');
                }
                await tx.tenantViolation.create({
                    data: {
                        tenantId: tenant.id,
                        violation: data.violation,
                        description: data.description,
                        amount: data.amount,
                        createdAt: new Date(),
                    },
                });
                return await tx.tenantViolation.findMany({
                    where: { tenantId: tenant.id, isDeleted: false },
                });
            });
            return violations;
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to create violation', {
                tenantId: tenant.id,
                violation: data.violation,
            });
        }
    }
    async updateViolation(data, tenant) {
        try {
            const violations = await prisma_config_1.default.$transaction(async (tx) => {
                logger_1.logger.i(`Updating violation ${data.id} for tenant ${tenant.id}`);
                const existingViolation = await tx.tenantViolation.findUnique({
                    where: {
                        id: data.id,
                    },
                });
                if (!existingViolation) {
                    throw new Error('Violation not found');
                }
                await tx.tenantViolation.update({
                    where: { id: data.id },
                    data: {
                        violation: data.violation,
                        description: data.description,
                        amount: data.amount,
                        updatedAt: new Date(),
                    },
                });
                return await tx.tenantViolation.findMany({
                    where: { tenantId: tenant.id, isDeleted: false },
                });
            });
            return violations;
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to update violation', {
                tenantId: tenant.id,
                violation: data.violation,
            });
            throw new Error('Failed to update violation');
        }
    }
    async deleteViolation(violationId, tenant) {
        try {
            const violations = await prisma_config_1.default.$transaction(async (tx) => {
                const existingViolation = await tx.tenantViolation.findUnique({
                    where: { id: violationId },
                });
                if (!existingViolation) {
                    throw new Error('Violation not found');
                }
                await tx.tenantViolation.update({
                    where: { id: violationId },
                    data: { isDeleted: true, updatedAt: new Date() },
                });
                return await tx.tenantViolation.findMany({
                    where: {
                        tenantId: tenant.id,
                        isDeleted: false,
                    },
                });
            });
            return violations;
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to delete violation', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                violationId,
            });
            throw new Error('Failed to delete violation');
        }
    }
}
exports.tenantViolationsService = new TenantViolationsService();
