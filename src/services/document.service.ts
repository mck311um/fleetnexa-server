import { logger } from '../config/logger';
import prisma, { TxClient } from '../config/prisma.config';
import customerService from '../modules/customer/customer.service';
import { tenantExtraService } from '../modules/tenant/modules/tenant-extras/tenant-extras.service';
import tenantService from '../modules/tenant/tenant.service';
import {
  InvoiceData,
  InvoiceItem,
  RentalAgreementData,
  RentalAgreementDriver,
  RentalService,
} from '../types/pdf';
import formatter from '../utils/formatter';

const generateInvoiceData = async (bookingId: string, tenantId: string) => {
  try {
    const tenantExtras = await tenantExtraService.getTenantExtras(tenantId);

    const getExtra = (id: string) => ({
      ...tenantExtras?.find((extra) => extra.id === id),
    });

    const booking = await prisma.rental.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: {
          include: {
            brand: true,
            model: true,
          },
        },
        return: true,
        pickup: true,
        chargeType: true,
        values: {
          include: { extras: true },
        },
        drivers: true,
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        currency: true,
        address: {
          include: { village: true, state: true, country: true },
        },
      },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const primaryDriver = await customerService.getPrimaryDriver(bookingId);

    const customerAddress = primaryDriver?.customer?.address
      ? [
          primaryDriver.customer.address.village?.village,
          primaryDriver.customer.address.state?.state,
          primaryDriver.customer.address.country?.country,
        ]
          .filter(Boolean)
          .join(', ')
      : 'No Address Provided';

    const services: RentalService[] = (booking?.values?.extras || []).map(
      (item) => {
        const extraItem = getExtra(item.extraId!);
        const cost = booking?.values?.extras?.find(
          (el) => el.extraId === extraItem?.id,
        )?.amount;

        return {
          label: extraItem?.name || '',
          description:
            typeof extraItem?.description === 'string'
              ? extraItem.description
              : '',
          amount: parseFloat((cost || 0).toFixed(2)),
        };
      },
    );

    const returnItem: InvoiceItem = {
      label: 'Return Fee',
      amount: parseFloat((booking?.return?.collectionFee || 0).toFixed(2)),
      description: `Car Pickup at ${booking?.return?.location || ''}`,
    };

    const pickupItem: InvoiceItem = {
      label: 'Pickup Fee',
      amount: parseFloat((booking?.pickup?.deliveryFee || 0).toFixed(2)),
      description: `Car Delivery to ${booking?.pickup?.location || ''}`,
    };

    const additionalDriverItem: InvoiceItem = {
      label: 'Additional Driver Fee',
      amount: parseFloat(
        (booking?.values?.additionalDriverFees || 0).toFixed(2),
      ),
      description: `Additional Driver Fee for ${
        (booking?.drivers?.length || 1) - 1
      } driver(s)`,
    };

    const filteredServices = [
      ...services.filter((item) => item.amount !== 0),
      ...(pickupItem.amount !== 0 ? [pickupItem] : []),
      ...(returnItem.amount !== 0 ? [returnItem] : []),
      ...(additionalDriverItem.amount !== 0 ? [additionalDriverItem] : []),
    ];

    const unitPlural = () => {
      switch (booking?.chargeType?.unit) {
        case 'day': {
          const days = booking?.values?.numberOfDays ?? 0;
          return `day${days > 1 ? 's' : ''}`;
        }
        case 'week': {
          const weeks = Math.ceil((booking?.values?.numberOfDays ?? 0) / 7);
          return `week${weeks > 1 ? 's' : ''}`;
        }
        case 'month': {
          const months = Math.ceil((booking?.values?.numberOfDays ?? 0) / 30);
          return `month${months > 1 ? 's' : ''}`;
        }
        default:
          return 'days';
      }
    };

    const numberOfUnits = () => {
      switch (booking?.chargeType?.unit) {
        case 'day':
          return booking?.values?.numberOfDays ?? 0;
        case 'week':
          return Math.ceil((booking?.values?.numberOfDays ?? 0) / 7);
        case 'month':
          return Math.ceil((booking?.values?.numberOfDays ?? 0) / 30);
        default:
          return booking?.values?.numberOfDays;
      }
    };

    const data: InvoiceData = {
      companyName: tenant?.tenantName || '',
      streetAddress: tenant?.address?.street || '',
      city: tenant?.address?.village?.village || '',
      state: tenant?.address?.state?.state || '',
      country: tenant?.address?.country?.country || '',
      email: tenant?.email || '',
      phone: tenant?.number || '',
      logoUrl: tenant?.logo || '',
      customerName: `${primaryDriver?.customer?.firstName} ${primaryDriver?.customer?.lastName}`,
      customerAddress: customerAddress,
      customerEmail: primaryDriver?.customer?.email || '',
      customerPhone: primaryDriver?.customer?.phone || '',
      invoiceNumber: '',
      issuedDate: `${formatter.formatDate(new Date())}`,
      dueDate: `${formatter.formatDate(booking?.startDate)}`,
      numberOfUnits: numberOfUnits() || 0,
      unitPlural: unitPlural(),
      unit: booking?.chargeType?.unit?.toString() || '',
      basePrice: parseFloat((booking?.values?.basePrice || 0).toFixed(2)),
      make: booking?.vehicle?.brand?.brand || '',
      model: booking?.vehicle?.model?.model || '',
      year: booking?.vehicle?.year || 0,
      color: booking?.vehicle?.color || '',
      licensePlate: booking?.vehicle?.licensePlate || '',
      startDate: `${formatter.formatDateToFriendlyWithTime(booking?.startDate)}`,
      endDate: `${formatter.formatDateToFriendlyWithTime(booking?.endDate)}`,
      pickupLocation: booking?.pickup?.location || '',
      returnLocation: booking?.return?.location || '',
      rentalAmount: parseFloat((booking?.values?.totalCost || 0).toFixed(2)),
      subTotal: parseFloat(
        (
          (booking?.values?.subTotal || 0) - (booking?.values?.deposit || 0)
        ).toFixed(2),
      ),
      deposit: parseFloat((booking?.values?.deposit || 0).toFixed(2)),
      total: parseFloat((booking?.values?.netTotal || 0).toFixed(2)),
      discount: parseFloat((booking?.values?.discount || 0).toFixed(2)),
      invoiceNotes: tenant?.invoiceFootNotes || '',
      services: filteredServices,
      currency: tenant?.currency?.code || 'XCD',
    };

    return data;
  } catch (error) {
    logger.e(error, 'Failed to generate invoice data', {
      bookingId,
      tenantId,
    });
    throw new Error('Failed to generate invoice data');
  }
};

const generateAgreementData = async (bookingId: string, tenantId: string) => {
  try {
    const tenantExtras = await tenantExtraService.getTenantExtras(tenantId);

    const getExtra = (id: string) => ({
      ...tenantExtras?.find((extra) => extra.id === id),
    });

    const booking = await prisma.rental.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: {
          include: {
            brand: true,
            transmission: true,
            fuelType: true,
            wheelDrive: true,
            model: {
              include: {
                bodyType: true,
              },
            },
          },
        },
        return: true,
        pickup: true,
        chargeType: true,
        values: {
          include: { extras: true },
        },
        drivers: {
          include: {
            customer: {
              include: {
                address: {
                  include: {
                    village: true,
                    state: true,
                    country: true,
                  },
                },
                license: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        currency: true,
        cancellationPolicy: true,
        latePolicy: true,
        address: {
          include: { village: true, state: true, country: true },
        },
      },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const pricePolicy = (policy: string) => {
      switch (policy) {
        case 'FLAT_RATE':
          return '/day';
        case 'FIXED_AMOUNT':
          return '';
        case 'PERCENTAGE':
          return '% of total';
      }
    };

    const services: RentalService[] = (booking?.values?.extras || []).map(
      (item) => {
        const extraItem = getExtra(item.extraId!);
        const cost = booking?.values?.extras?.find(
          (el) => el.extraId === extraItem?.id,
        )?.amount;

        return {
          label: extraItem?.name || '',
          description:
            typeof extraItem?.description === 'string'
              ? extraItem.description
              : '',
          amount: parseFloat((cost || 0).toFixed(2)),
          rate: extraItem?.price || 0,
          policy: pricePolicy(
            typeof extraItem?.pricePolicy === 'string'
              ? extraItem.pricePolicy
              : '',
          ),
        };
      },
    );

    const returnItem: InvoiceItem = {
      label: 'Return Fee',
      amount: parseFloat((booking?.return?.collectionFee || 0).toFixed(2)),
      rate: booking?.return?.collectionFee || 0,
    };

    const additionalDriverItem: InvoiceItem = {
      label: 'Additional Driver Fee',
      amount: parseFloat(
        (booking?.values?.additionalDriverFees || 0).toFixed(2),
      ),
      rate: tenant?.additionalDriverFee || 0,
    };

    const pickupItem: InvoiceItem = {
      label: 'Pickup Fee',
      amount: parseFloat((booking?.pickup?.deliveryFee || 0).toFixed(2)),
      rate: booking?.pickup?.deliveryFee || 0,
    };

    const extrasTotal = services.reduce(
      (acc, item) => acc + (item.amount || 0),
      0,
    );

    const filteredServices = [
      ...services.filter((item) => item.amount !== 0),
      ...(pickupItem.amount !== 0 ? [pickupItem] : []),
      ...(returnItem.amount !== 0 ? [returnItem] : []),
      ...(additionalDriverItem.amount !== 0 ? [additionalDriverItem] : []),
    ];

    const unitPlural = () => {
      switch (booking?.chargeType?.unit) {
        case 'day': {
          const days = booking?.values?.numberOfDays ?? 0;
          return `day${days > 1 ? 's' : ''}`;
        }
        case 'week': {
          const weeks = Math.ceil((booking?.values?.numberOfDays ?? 0) / 7);
          return `week${weeks > 1 ? 's' : ''}`;
        }
        case 'month': {
          const months = Math.ceil((booking?.values?.numberOfDays ?? 0) / 30);
          return `month${months > 1 ? 's' : ''}`;
        }
        default:
          return 'days';
      }
    };

    const numberOfUnits = () => {
      switch (booking?.chargeType?.unit) {
        case 'day':
          return booking?.values?.numberOfDays ?? 0;
        case 'week':
          return Math.ceil((booking?.values?.numberOfDays ?? 0) / 7);
        case 'month':
          return Math.ceil((booking?.values?.numberOfDays ?? 0) / 30);
        default:
          return booking?.values?.numberOfDays;
      }
    };

    const getPolicyText = (policy: string) => {
      switch (policy) {
        case 'percent':
          return `${
            tenant?.cancellationPolicy?.amount ?? 0
          }% of the total booking amount`;
        case 'fixed_amount':
          return `${formatter.formatCurrencyWithCode(
            tenant.currency?.code || 'USD',
            tenant?.cancellationPolicy?.amount ?? 0,
          )}`;
        default:
          return `${formatter.formatCurrencyWithCode(
            tenant.currency?.code || 'USD',
            tenant?.cancellationPolicy?.amount ?? 0,
          )}`;
      }
    };

    const drivers: RentalAgreementDriver[] = (booking?.drivers || []).map(
      (el) => ({
        firstName: el.customer?.firstName || '',
        lastName: el.customer?.lastName || '',
        dateOfBirth: formatter.formatDateToFriendly(
          el.customer?.dateOfBirth || '',
        ),
        licenseNumber: el.customer?.license?.licenseNumber || '',
        license: el.customer?.license?.licenseNumber || '',
        email: el.customer?.email || '',
        phone: el.customer?.phone || '',
        address: el.customer?.address?.street || '',
        issuedDate: formatter.formatDateToFriendly(
          el.customer?.license?.licenseIssued || '',
        ),
        expiryDate: formatter.formatDateToFriendly(
          el.customer?.license?.licenseExpiry || '',
        ),
        city: el.customer?.address?.village?.village || '',
        country: el.customer?.address?.country?.country || '',
        primaryDriver: el.isPrimary || false,
      }),
    );

    const localStartTime = booking?.startDate
      ? new Date(booking.startDate).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    const localEndTime = booking?.endDate
      ? new Date(booking.endDate).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    const data: RentalAgreementData = {
      tenantName: tenant?.tenantName || '',
      street: tenant?.address?.street || '',
      village: tenant?.address?.village?.village || '',
      parish: tenant?.address?.state?.state || '',
      country: tenant?.address?.country?.country || '',
      email: tenant?.email || '',
      phone: tenant?.number || '',
      agreementNumber: '',
      agreementDate: formatter.formatDate(new Date()),
      make: booking?.vehicle?.brand?.brand || '',
      model: booking?.vehicle?.model?.model || '',
      plate: booking?.vehicle?.licensePlate || '',
      bodyType: booking?.vehicle.model?.bodyType?.bodyType || '',
      transmission: booking?.vehicle?.transmission?.transmission || '',
      color: booking?.vehicle?.color || '',
      year: booking?.vehicle?.year || 0,
      fuelPercent: `${booking?.vehicle?.fuelLevel}%`,
      mileage: formatter.formatMilage(booking?.vehicle?.odometer || 0) || '',
      fuel: booking?.vehicle?.fuelType?.fuel || '',
      drive: booking?.vehicle?.wheelDrive?.drive || '',
      featuredImage: booking?.vehicle?.featuredImage || '',
      pickupDate: `${formatter.formatDateToFriendly(booking?.startDate || '')}`,
      pickupLocation: booking?.pickup?.location || '',
      pickupTime: `${localStartTime}`,
      returnDate: `${formatter.formatDateToFriendly(booking?.endDate || '')}`,
      returnLocation: booking?.return?.location || '',
      returnTime: `${localEndTime}`,
      drivers,
      numberOfUnits: numberOfUnits() || 0,
      unit: booking?.chargeType?.unit?.toString() || 'day',
      unitPlural: unitPlural(),
      basePrice: parseFloat((booking?.values?.basePrice || 0).toFixed(2)),
      rentalAmount: parseFloat((booking?.values?.totalCost || 0).toFixed(2)),
      services: filteredServices,
      extrasTotal: parseFloat(
        (extrasTotal + pickupItem.amount + returnItem.amount).toFixed(2),
      ),
      securityDeposit: parseFloat((booking?.values?.deposit || 0).toFixed(2)),
      total: parseFloat((booking?.values?.netTotal || 0).toFixed(2)),
      currency: tenant?.currency?.code || 'USD',
      minimumDays: tenant?.cancellationPolicy?.minimumDays || 0,
      bookingMinimumDays: tenant?.cancellationPolicy?.bookingMinimumDays || 0,
      cancellationText: getPolicyText(
        tenant?.cancellationPolicy?.policy || 'fixed_amount',
      ),
      discount: booking?.values?.discount || 0,
      discountAmount: booking?.values?.discountAmount || 0,
      lateAmount: tenant?.latePolicy?.amount ?? 0,
      maxHours: tenant?.latePolicy?.maxHours || 0,
      dailyRate: parseFloat((booking?.vehicle?.dayPrice || 0).toFixed(2)),
    };

    return data;
  } catch (error) {
    logger.e(error, 'Failed to generate agreement data', {
      tenantId,
      bookingId,
    });
    throw new Error('Failed to generate agreement data');
  }
};

export default {
  generateInvoiceData,
  generateAgreementData,
};
