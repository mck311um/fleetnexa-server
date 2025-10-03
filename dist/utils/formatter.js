"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const library_1 = require("@prisma/client/runtime/library");
const logger_1 = require("../config/logger");
const formatDateToFriendlyDateShort = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
};
const formatDateToFriendly = (date) => {
    if (!date)
        return '';
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return new Date(date).toLocaleString('en-US', options);
};
const formatDateToFriendlyDate = (date) => {
    if (!date)
        return '';
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return new Date(date).toLocaleString('en-US', options);
};
const formatDateToFriendlyTime = (date) => {
    if (!date)
        return '';
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    return new Date(date).toLocaleString('en-US', options);
};
const formatDateToFriendlyWithTime = (date) => {
    if (!date)
        return '';
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    return new Date(date).toLocaleString('en-US', options);
};
const formatNumberToTenantCurrency = (amount, currency = 'USD') => {
    if (amount == null)
        return '';
    try {
        const options = {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        };
        return new Intl.NumberFormat(undefined, options).format(amount);
    }
    catch (error) {
        logger_1.logger.e(error, 'Invalid currency code:', { currency });
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    }
};
const formatVehicleToFriendly = (vehicle) => {
    if (!vehicle)
        return '';
    const brandName = vehicle.brand?.brand ?? '';
    const modelName = vehicle.model?.model ?? '';
    const year = vehicle.year ?? '';
    return `${brandName} ${modelName} (${year})`.trim();
};
const formatCurrencyWithCode = (code, amount) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount instanceof library_1.Decimal ? amount.toNumber() : amount);
    return `${code} ${formattedAmount}`;
};
const formatMilage = (mileage) => {
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(mileage);
    return `${formatted} km`;
};
exports.default = {
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
