"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../../../config/logger");
const tenant_repository_1 = require("../../../../repository/tenant.repository");
const currency_rates_service_1 = require("./currency-rates.service");
const currency_rates_dto_1 = require("./currency-rates.dto");
const getTenantCurrencyRates = async (req, res) => {
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
        const currencyRates = await currency_rates_service_1.tenantCurrencyRatesService.getTenantCurrencyRates(tenant);
        return res.status(200).json(currencyRates);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get currency rates', { tenantId, tenantCode });
        return res.status(500).json({ message: 'Failed to get currency rates' });
    }
};
const updateTenantCurrencyRate = async (req, res) => {
    const { data } = req.body;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    if (!data) {
        logger_1.logger.w('Currency rate data is missing');
        return res.status(400).json({ message: 'Currency rate data is required' });
    }
    const parseResult = currency_rates_dto_1.CurrencyRateSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid user data',
            details: parseResult.error.issues,
        });
    }
    const currencyDto = parseResult.data;
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        const currencyRates = await currency_rates_service_1.tenantCurrencyRatesService.updateTenantCurrencyRate(currencyDto, tenant);
        return res
            .status(200)
            .json({ message: 'Currency rate updated successfully', currencyRates });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update currency rate', {
            tenantId,
            tenantCode,
            currencyDto,
        });
        return res.status(500).json({ message: 'Failed to update currency rate' });
    }
};
exports.default = {
    getTenantCurrencyRates,
    updateTenantCurrencyRate,
};
