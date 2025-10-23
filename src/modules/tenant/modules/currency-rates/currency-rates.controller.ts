import { Request, Response } from 'express';
import { logger } from '../../../../config/logger';
import { tenantRepo } from '../../../../repository/tenant.repository';
import { tenantCurrencyRatesService } from './currency-rates.service';
import { CurrencyRateSchema } from './currency-rates.dto';

const getTenantCurrencyRates = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  try {
    const tenant = await tenantRepo.getTenantById(tenantId);
    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const currencyRates =
      await tenantCurrencyRatesService.getTenantCurrencyRates(tenant);
    return res.status(200).json(currencyRates);
  } catch (error) {
    logger.e(error, 'Failed to get currency rates', { tenantId, tenantCode });
    return res.status(500).json({ message: 'Failed to get currency rates' });
  }
};

const updateTenantCurrencyRate = async (req: Request, res: Response) => {
  const data = req.body;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  if (!data) {
    logger.w('Currency rate data is missing');
    return res.status(400).json({ message: 'Currency rate data is required' });
  }

  const parseResult = CurrencyRateSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid user data',
      details: parseResult.error.issues,
    });
  }

  const currencyDto = parseResult.data;

  try {
    const tenant = await tenantRepo.getTenantById(tenantId);
    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const currencyRates =
      await tenantCurrencyRatesService.updateTenantCurrencyRate(
        currencyDto,
        tenant,
      );

    return res
      .status(200)
      .json({ message: 'Currency rate updated successfully', currencyRates });
  } catch (error) {
    logger.e(error, 'Failed to update currency rate', {
      tenantId,
      tenantCode,
      currencyDto,
    });
    return res.status(500).json({ message: 'Failed to update currency rate' });
  }
};

export default {
  getTenantCurrencyRates,
  updateTenantCurrencyRate,
};
