import { Tenant } from '@prisma/client';
import prisma from '../../../../config/prisma.config';
import { logger } from '../../../../config/logger';
import { CurrencyRateDto } from './currency-rates.dto';

class CurrencyRatesService {
  async getTenantCurrencyRates(tenant: Tenant) {
    try {
      const currencyRates = await prisma.tenantCurrencyRate.findMany({
        where: { tenantId: tenant.id },
        include: {
          currency: true,
        },
      });
      return currencyRates;
    } catch (error) {
      logger.e(error, 'Failed to fetch currency rates', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to fetch currency rates');
    }
  }

  async updateTenantCurrencyRate(data: CurrencyRateDto, tenant: Tenant) {
    try {
      const rates = await prisma.$transaction(async (tx) => {
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
    } catch (error) {
      logger.e(error, 'Failed to update currency rate', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw new Error('Failed to update currency rate');
    }
  }
}

export const tenantCurrencyRatesService = new CurrencyRatesService();
