import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient, Tenant, User } from '../../generated/prisma/client.js';
import { GeneratorService } from '../generator/generator.service.js';
import { TenantExtraService } from '../../modules/tenant/tenant-extra/tenant-extra.service.js';
import { CustomerService } from '../../modules/customer/customer.service.js';
import {
  InvoiceData,
  InvoiceItem,
  RentalAgreementData,
  RentalAgreementDriver,
  RentalService,
} from 'src/types/pdf.js';
import { format, toZonedTime } from 'date-fns-tz';
import { FormatterService } from '../formatter/formatter.service.js';
import { PdfService } from '../pdf/pdf.service.js';

export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  constructor(
    private readonly prisma: PrismaClient,
    private readonly generator: GeneratorService,
    private readonly formatter: FormatterService,
    private readonly tenantExtraService: TenantExtraService,
    private readonly customerService: CustomerService,
    private readonly pdfService: PdfService,
  ) {}

  async generateInvoice(bookingId: any, tenant: Tenant, user: User) {
    try {
      let invoiceNumber;

      const booking = await this.prisma.rental.findUnique({
        where: { id: bookingId },
        include: { values: true },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      const existingInvoice = await this.prisma.invoice.findUnique({
        where: { rentalId: bookingId },
      });

      if (existingInvoice) {
        invoiceNumber = existingInvoice.invoiceNumber;
      } else {
        invoiceNumber = await this.generator.generateInvoiceNumber(tenant.id);
      }

      const data = await this.generateInvoiceData(bookingId, tenant.id);

      data.invoiceNumber = invoiceNumber;
      const pdfResult = await this.pdfService.createInvoice(
        data,
        invoiceNumber,
        tenant.tenantCode,
      );

      const primaryDriver =
        await this.customerService.getPrimaryDriver(bookingId);

      if (!primaryDriver) {
        throw new NotFoundException('Primary driver not found');
      }

      const invoice = await this.prisma.invoice.upsert({
        where: { rentalId: bookingId },
        create: {
          invoiceNumber,
          amount: booking?.values?.netTotal || 0,
          customerId: primaryDriver?.driverId || '',
          rentalId: booking?.id || '',
          tenantId: tenant.id!,
          createdAt: new Date(),
          createdBy: user.username,
          invoiceUrl: pdfResult.publicUrl,
        },
        update: {
          amount: booking?.values?.netTotal || 0,
          customerId: primaryDriver?.driverId || '',
          tenantId: tenant.id!,
          invoiceUrl: pdfResult.publicUrl,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });

      return invoice;
    } catch (error) {
      this.logger.error(error, 'Failed to generate invoice', {
        bookingId,
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to generate invoice');
    }
  }

  async generateInvoiceData(bookingId: string, tenantId: string) {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          currency: true,
          address: {
            include: { village: true, state: true, country: true },
          },
        },
      });

      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      const tenantExtras =
        await this.tenantExtraService.getTenantExtras(tenant);

      const getExtra = (id: string) => ({
        ...tenantExtras?.find((extra) => extra.id === id),
      });

      const booking = await this.prisma.rental.findUnique({
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

      const primaryDriver =
        await this.customerService.getPrimaryDriver(bookingId);

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
      const localStartDate = booking?.startDate
        ? toZonedTime(booking.startDate, 'America/Dominica')
        : '';

      const formattedStartDate = format(
        localStartDate,
        'EEE, MMM d, yyyy hh:mm aa',
      );

      const localEndDate = booking?.endDate
        ? toZonedTime(booking.endDate, 'America/Dominica')
        : '';
      const formattedEndDate = format(
        localEndDate,
        'EEE, MMM d, yyyy hh:mm aa',
      );

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
        issuedDate: `${this.formatter.formatDate(new Date())}`,
        dueDate: `${this.formatter.formatDate(booking?.startDate)}`,
        numberOfUnits: numberOfUnits() || 0,
        unitPlural: unitPlural(),
        unit: booking?.chargeType?.unit?.toString() || '',
        basePrice: parseFloat((booking?.values?.basePrice || 0).toFixed(2)),
        make: booking?.vehicle?.brand?.brand || '',
        model: booking?.vehicle?.model?.model || '',
        year: booking?.vehicle?.year || 0,
        color: booking?.vehicle?.color || '',
        licensePlate: booking?.vehicle?.licensePlate || '',
        startDate: formattedStartDate,
        endDate: formattedEndDate,
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
      this.logger.error(error, 'Failed to generate invoice data', {
        bookingId,
        tenantId,
      });
      throw new Error('Failed to generate invoice data');
    }
  }

  generateAgreementData = async (bookingId: string, tenantId: string) => {
    try {
      const tenant = await this.prisma.tenant.findUnique({
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
        throw new NotFoundException('Tenant not found');
      }

      const tenantExtras =
        await this.tenantExtraService.getTenantExtras(tenant);

      const getExtra = (id: string) => ({
        ...tenantExtras?.find((extra) => extra.id === id),
      });

      const booking = await this.prisma.rental.findUnique({
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
            return `${this.formatter.formatCurrencyWithCode(
              tenant.currency?.code || 'USD',
              tenant?.cancellationPolicy?.amount ?? 0,
            )}`;
          default:
            return `${this.formatter.formatCurrencyWithCode(
              tenant.currency?.code || 'USD',
              tenant?.cancellationPolicy?.amount ?? 0,
            )}`;
        }
      };

      const drivers: RentalAgreementDriver[] = (booking?.drivers || []).map(
        (el) => ({
          firstName: el.customer?.firstName || '',
          lastName: el.customer?.lastName || '',
          dateOfBirth: this.formatter.formatDateToFriendly(
            el.customer?.dateOfBirth || '',
          ),
          licenseNumber: el.customer?.license?.licenseNumber || '',
          license: el.customer?.license?.licenseNumber || '',
          email: el.customer?.email || '',
          phone: el.customer?.phone || '',
          address: el.customer?.address?.street || '',
          issuedDate: this.formatter.formatDateToFriendly(
            el.customer?.license?.licenseIssued || '',
          ),
          expiryDate: this.formatter.formatDateToFriendly(
            el.customer?.license?.licenseExpiry || '',
          ),
          city: el.customer?.address?.village?.village || '',
          country: el.customer?.address?.country?.country || '',
          primaryDriver: el.isPrimary || false,
        }),
      );

      const localStartDate = booking?.startDate
        ? toZonedTime(booking.startDate, 'America/Dominica')
        : '';
      const localStartTime = format(localStartDate, 'hh:mm aa');

      const localEndDate = booking?.endDate
        ? toZonedTime(booking.endDate, 'America/Dominica')
        : '';
      const localEndTime = format(localEndDate, 'hh:mm aa');

      const data: RentalAgreementData = {
        tenantName: tenant?.tenantName || '',
        street: tenant?.address?.street || '',
        village: tenant?.address?.village?.village || '',
        parish: tenant?.address?.state?.state || '',
        country: tenant?.address?.country?.country || '',
        email: tenant?.email || '',
        phone: tenant?.number || '',
        agreementNumber: '',
        agreementDate: await this.formatter.formatDate(new Date()),
        make: booking?.vehicle?.brand?.brand || '',
        model: booking?.vehicle?.model?.model || '',
        plate: booking?.vehicle?.licensePlate || '',
        bodyType: booking?.vehicle.model?.bodyType?.bodyType || '',
        transmission: booking?.vehicle?.transmission?.transmission || '',
        color: booking?.vehicle?.color || '',
        year: booking?.vehicle?.year || 0,
        fuelPercent: `${booking?.vehicle?.fuelLevel}%`,
        mileage:
          (await this.formatter.formatMilage(
            booking?.vehicle?.odometer || 0,
          )) || '',
        fuel: booking?.vehicle?.fuelType?.fuel || '',
        drive: booking?.vehicle?.wheelDrive?.drive || '',
        featuredImage: booking?.vehicle?.featuredImage || '',
        pickupDate: `${this.formatter.formatDateToFriendly(booking?.startDate || '')}`,
        pickupLocation: booking?.pickup?.location || '',
        pickupTime: `${localStartTime}`,
        returnDate: `${this.formatter.formatDateToFriendly(booking?.endDate || '')}`,
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
      this.logger.error(error, 'Failed to generate agreement data', {
        tenantId,
        bookingId,
      });
      throw new Error('Failed to generate agreement data');
    }
  };
}
