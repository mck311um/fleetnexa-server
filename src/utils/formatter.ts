import { Decimal } from '@prisma/client/runtime/library';
import { logger } from '../config/logger';

const formatDateToFriendlyDateShort = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const formatDateToFriendly = (
  date: Date | string | null | undefined,
): string => {
  if (!date) return '';

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Date(date).toLocaleString('en-US', options);
};

const formatDateToFriendlyDate = (
  date: Date | string | null | undefined,
): string => {
  if (!date) return '';

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Date(date).toLocaleString('en-US', options);
};

const formatDateToFriendlyTime = (
  date: Date | string | null | undefined,
): string => {
  if (!date) return '';

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  return new Date(date).toLocaleString('en-US', options);
};

const formatDateToFriendlyWithTime = (date: Date): string => {
  if (!date) return '';

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  return new Date(date).toLocaleString('en-US', options);
};

const formatNumberToTenantCurrency = (
  amount: number | null | undefined,
  currency: string = 'USD',
): string => {
  if (amount == null) return '';

  try {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    return new Intl.NumberFormat(undefined, options).format(amount);
  } catch (error) {
    logger.e(error, 'Invalid currency code:', { currency });
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
};
const formatVehicleToFriendly = (vehicle: any): string => {
  if (!vehicle) return '';

  const brandName = vehicle.brand?.brand ?? '';
  const modelName = vehicle.model?.model ?? '';
  const year = vehicle.year ?? '';

  return `${brandName} ${modelName} (${year})`.trim();
};

const formatCurrencyWithCode = (
  code: string,
  amount: number | Decimal,
): string => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount instanceof Decimal ? amount.toNumber() : amount);

  return `${code} ${formattedAmount}`;
};

const formatMilage = (mileage: number): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(mileage);

  return `${formatted} km`;
};

export default {
  formatDate,
  formatDateToFriendly,
  formatNumberToTenantCurrency,
  formatVehicleToFriendly,
  formatDateToFriendlyDate,
  formatDateToFriendlyTime,
  formatDateToFriendlyDateShort,
  formatDateToFriendlyWithTime,
  formatCurrencyWithCode,
  formatMilage,
};
