"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../config/logger");
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
const tenant_repository_1 = require("./tenant.repository");
const generator_service_1 = __importDefault(require("../../services/generator.service"));
const getTenantById = async (tenantId, tx) => {
    try {
        return await tenant_repository_1.repo.getTenantById(tenantId, tx);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get tenant by ID', {
            tenantId,
        });
        throw new Error('Failed to get tenant by ID');
    }
};
const createTenant = async (data, tx) => {
    try {
        const existingTenant = await tenant_repository_1.repo.getTenantByEmail(data.email, tx);
        if (existingTenant) {
            throw new Error('Tenant with this email already exists');
        }
        const tenantCode = await generator_service_1.default.generateTenantCode(data.tenantName);
        const slug = await generator_service_1.default.generateTenantSlug(data.tenantName);
        const tenant = await tx.tenant.create({
            data: {
                tenantCode,
                tenantName: data.tenantName,
                slug,
                email: data.email,
                number: data.number,
                logo: 'https://fleetnexa.s3.us-east-1.amazonaws.com/Global+Images/placeholder_tenant.jpg',
            },
        });
        const userDetails = {
            email: '',
            firstName: data.firstName,
            lastName: data.lastName,
            roleId: '',
        };
        // const { user, password } = await userService.createOwner(
        //   userDetails,
        //   tenant,
        //   tx,
        // );
        // return { tenant, user, password };
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to create tenant', {
            email: data.email,
            tenantName: data.tenantName,
        });
        throw new Error('Failed to create tenant');
    }
};
const updateTenant = async (data, tenant) => {
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            await prisma_config_1.default.address.upsert({
                where: { tenantId: tenant.id },
                update: {
                    street: data.address.street,
                    village: { connect: { id: data.address.villageId } },
                    state: { connect: { id: data.address.stateId } },
                    country: { connect: { id: data.address.countryId } },
                },
                create: {
                    tenant: { connect: { id: tenant.id } },
                    street: data.address.street,
                    village: { connect: { id: data.address.villageId } },
                    state: { connect: { id: data.address.stateId } },
                    country: { connect: { id: data.address.countryId } },
                },
            });
            await tx.tenant.update({
                where: { id: tenant.id },
                data: {
                    currencyId: data.currencyId,
                    email: data.email,
                    invoiceFootNotes: data.invoiceFootNotes,
                    invoiceSequenceId: data.invoiceSequenceId,
                    logo: data.logo,
                    number: data.number,
                    tenantName: data.tenantName,
                    financialYearStart: data.financialYearStart,
                    setupCompleted: true,
                    securityDeposit: data.securityDeposit,
                    additionalDriverFee: data.additionalDriverFee,
                    daysInMonth: data.daysInMonth,
                    description: data.description,
                    paymentMethods: {
                        set: data.paymentMethods.map((method) => ({ id: method })),
                    },
                },
            });
            await tx.cancellationPolicy.upsert({
                where: {
                    tenantId: tenant.id,
                },
                update: {
                    amount: data.cancellationPolicy?.amount || 0,
                    policy: data.cancellationPolicy?.policy || 'fixed_amount',
                    minimumDays: data.cancellationPolicy?.minimumDays || 0,
                },
                create: {
                    tenantId: tenant.id,
                    amount: data.cancellationPolicy?.amount || 0,
                    policy: data.cancellationPolicy?.policy || 'fixed_amount',
                    minimumDays: data.cancellationPolicy?.minimumDays || 0,
                    bookingMinimumDays: data.cancellationPolicy?.bookingMinimumDays || 0,
                },
            });
            await tx.latePolicy.upsert({
                where: {
                    tenantId: tenant.id,
                },
                update: {
                    amount: data.latePolicy?.amount || 0,
                    maxHours: data.latePolicy?.maxHours || 0,
                },
                create: {
                    tenantId: tenant.id,
                    amount: data.latePolicy?.amount || 0,
                    maxHours: data.latePolicy?.maxHours || 0,
                },
            });
            const usdRate = await tx.tenantCurrencyRate.findFirst({
                where: { tenantId: tenant.id, currency: { code: 'USD' } },
            });
            const usd = await tx.currency.findUnique({
                where: { code: 'USD' },
            });
            if (!usd) {
                logger_1.logger.i(`USD currency not found for tenant ${tenant.id}`);
                throw new Error('USD currency not found');
            }
            if (usdRate) {
                await tx.tenantCurrencyRate.update({
                    where: { id: usdRate.id },
                    data: {
                        fromRate: data.fromUSDRate || 1.0,
                        toRate: 1 / (data.fromUSDRate || 1.0),
                    },
                });
            }
            else {
                await tx.tenantCurrencyRate.create({
                    data: {
                        tenantId: tenant.id,
                        currencyId: usd.id,
                        fromRate: data.fromUSDRate || 1.0,
                        toRate: 1 / (data.fromUSDRate || 1.0),
                    },
                });
            }
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update tenant', {
            tenantId: tenant.id,
            data,
        });
        throw new Error('Failed to update tenant');
    }
};
const createViolation = async (data, tenant) => {
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
                    id: data.id,
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
};
const updateViolation = async (data, tenant) => {
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
};
exports.default = {
    createTenant,
    getTenantById,
    createViolation,
    updateViolation,
    updateTenant,
};
