const formatDateToFriendlyDateShort = (date: Date) => {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatDateToFriendly = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "";

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  return new Date(date).toLocaleString("en-US", options);
};

const formatDateToFriendlyDate = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "";

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Date(date).toLocaleString("en-US", options);
};

const formatDateToFriendlyTime = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "";

  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  return new Date(date).toLocaleString("en-US", options);
};

const formatNumberToTenantCurrency = (
  amount: number | null | undefined,
  currency: string = "USD"
): string => {
  if (amount == null) return "";

  try {
    const options: Intl.NumberFormatOptions = {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    return new Intl.NumberFormat(undefined, options).format(amount);
  } catch (error) {
    console.error("Invalid currency code:", currency);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
};

const formatVehicleToFriendly = (vehicle: any): string => {
  if (!vehicle) return "";

  return `${vehicle.brand.brand} ${vehicle.model.model} (${vehicle.year})`;
};

export default {
  formatDateToFriendly,
  formatNumberToTenantCurrency,
  formatVehicleToFriendly,
  formatDateToFriendlyDate,
  formatDateToFriendlyTime,
  formatDateToFriendlyDateShort,
};
