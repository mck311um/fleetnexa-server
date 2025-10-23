"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantCurrencyRatesService = void 0;
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const logger_1 = require("../../../../config/logger");
class CurrencyRatesService {
    async getTenantCurrencyRates(tenant) {
        try {
            const currencyRates = await prisma_config_1.default.tenantCurrencyRate.findMany({
                where: { tenantId: tenant.id },
                include: {
                    currency: true,
                },
            });
            return currencyRates;
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to fetch currency rates', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Failed to fetch currency rates');
        }
    }
    async updateTenantCurrencyRate(data, tenant) {
        try {
            const rates = await prisma_config_1.default.$transaction(async (tx) => {
                const existingRate = await tx.tenantCurrencyRate.findFirst({
                    where: { id: data.id, tenantId: tenant.id },
                });
                if (!existingRate) {
                    throw new Error('Currency rate not found');
                }
                await tx.tenantCurrencyRate.update({
                    where: { id: data.id },
                    data,
                    include: { currency: true },
                });
                return await tx.tenantCurrencyRate.findMany({
                    where: { tenantId: tenant.id },
                    include: { currency: true },
                });
            });
            return rates;
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to update currency rate', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                data,
            });
            throw new Error('Failed to update currency rate');
        }
    }
}
exports.tenantCurrencyRatesService = new CurrencyRatesService();
