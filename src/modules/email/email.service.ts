import prisma, { TxClient } from '../../config/prisma.config';
import {
  BookingCompletedEmailParams,
  BookingConfirmationEmailParams,
  BookingDocumentsEmailParams,
  VerifyBusinessEmailParams,
  WelcomeEmailParams,
} from '../../types/email';
import formatter from '../../utils/formatter';
import ses from '../../services/ses.service';
import { logger } from '../../config/logger';
import customerService from '../customer/customer.service';
import { EmailVerification, Tenant } from '@prisma/client';
import { SendBookingDocumentsDto } from './email.dto';

class EmailService {
  async sendBusinessVerificationEmail(
    tenant: Tenant,
    token: EmailVerification,
  ) {
    try {
      const templateData: VerifyBusinessEmailParams = {
        tenantName: tenant.tenantName,
        email: tenant.email,
        verificationCode: token.token,
        timestamp: formatter.formatDateToFriendlyWithTime(token.expiresAt),
      };

      await ses.sendEmail({
        to: [tenant.email || ''],
        template: 'VerifyBusinessEmail',
        templateData,
      });
    } catch (error) {
      logger.e(error, 'Error sending business verification email', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }

  async sendBookingDocumentsEmail(
    data: SendBookingDocumentsDto,
    tenant: Tenant,
  ) {
    try {
      const currency = await prisma.currency.findUnique({
        where: { id: tenant.currencyId! },
      });

      if (!currency) {
        logger.w('Currency not found', { currencyId: tenant.currencyId });
        throw new Error('Currency not found');
      }

      const booking = await prisma.rental.findUnique({
        where: { id: data.bookingId },
        include: {
          pickup: true,
          vehicle: {
            include: {
              brand: true,
              model: {
                include: {
                  bodyType: true,
                },
              },
              transmission: true,
            },
          },
          invoice: true,
          agreement: true,
          values: true,
        },
      });

      if (!booking) {
        logger.w('Booking not found', { bookingId: data.bookingId });
        throw new Error('Booking not found');
      }

      const templateData: BookingDocumentsEmailParams = {
        bookingId: booking?.bookingCode || '',
        startDate: formatter.formatDateToFriendlyDate(booking?.startDate) || '',
        pickupTime:
          formatter.formatDateToFriendlyTime(booking?.startDate) || '',
        endDate: formatter.formatDateToFriendlyDate(booking?.endDate) || '',
        pickupLocation: booking?.pickup.location || '',
        totalPrice: formatter.formatNumberToTenantCurrency(
          booking?.values?.netTotal || 0,
          currency?.code || 'USD',
        ),
        tenantName: tenant?.tenantName || '',
        phone: tenant?.number || '',
        vehicle: formatter.formatVehicleToFriendly(booking?.vehicle) || '',
        email: tenant?.email || '',
        invoiceUrl: data.includeInvoice
          ? booking?.invoice?.invoiceUrl || ''
          : undefined,
        agreementUrl: data.includeAgreement
          ? booking?.agreement?.agreementUrl || ''
          : undefined,
      };

      await ses.sendEmail({
        to: [data.to],
        template: 'BookingDocuments',
        templateData,
      });
    } catch (error) {
      logger.e(error, 'Error sending booking documents email', {
        bookingId: data.bookingId,
        tenantId: tenant?.id,
        tenantCode: tenant?.tenantCode,
      });
      throw error;
    }
  }

  async sendBookingCompletedEmail(bookingId: string, tenant: Tenant) {
    try {
      const booking = await prisma.rental.findUnique({
        where: { id: bookingId, tenantId: tenant.id },
        include: {
          values: true,
          pickup: true,
          vehicle: {
            include: {
              brand: true,
              model: true,
            },
          },
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      let currency;

      if (!tenant.currencyId) {
        currency = await prisma.currency.findFirst({
          where: { code: 'USD' },
        });
      } else {
        currency = await prisma.currency.findUnique({
          where: { id: tenant.currencyId },
        });
      }

      const primaryDriver = await customerService.getPrimaryDriver(booking.id);

      const templateData: BookingCompletedEmailParams = {
        bookingId: booking?.bookingCode || '',
        startDate: formatter.formatDateToFriendlyDate(booking?.startDate) || '',
        pickupTime:
          formatter.formatDateToFriendlyTime(booking?.startDate) || '',
        endDate: formatter.formatDateToFriendlyDate(booking?.endDate) || '',
        pickupLocation: booking?.pickup.location || '',
        totalPrice: formatter.formatNumberToTenantCurrency(
          booking?.values?.netTotal || 0,
          currency?.code || 'USD',
        ),
        tenantName: tenant?.tenantName || '',
        phone: tenant?.number || '',
        vehicle: formatter.formatVehicleToFriendly(booking?.vehicle) || '',
        email: tenant?.email || '',
      };

      await ses.sendEmail({
        to: [primaryDriver?.customer.email || ''],
        cc: [],
        from: 'no-reply@rentnexa.com',
        template: 'BookingCompleted',
        templateData,
      });
    } catch (error) {
      logger.e(error, 'Error sending booking completed email', {
        bookingId,
        tenantId: tenant?.id,
        tenantCode: tenant?.tenantCode,
      });
      throw error;
    }
  }
}

export const emailService = new EmailService();

const sendWelcomeEmail = async (
  tenant: Tenant,
  username: string,
  password: string,
  name: string,
) => {
  try {
    const templateData: WelcomeEmailParams = {
      tenantName: tenant.tenantName,
      username,
      password,
      name,
    };

    await ses.sendEmail({
      to: [tenant.email || ''],
      template: 'WelcomeTemplate',
      templateData,
    });
  } catch (error) {
    logger.e(error, 'Error sending welcome email', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    throw error;
  }
};

const sendConfirmationEmail = async (
  bookingId: string,
  includeInvoice: boolean,
  includeAgreement: boolean,
  tenant: Tenant,
) => {
  try {
    let currency;

    if (!tenant.currencyId) {
      currency = await prisma.currency.findFirst({
        where: { code: 'USD' },
      });
    } else {
      currency = await prisma.currency.findUnique({
        where: { id: tenant.currencyId },
      });
    }

    const booking = await prisma.rental.findUnique({
      where: { id: bookingId },
      include: {
        pickup: true,
        vehicle: {
          include: {
            brand: true,
            model: {
              include: {
                bodyType: true,
              },
            },
            transmission: true,
          },
        },
        invoice: true,
        agreement: true,
        values: true,
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const primaryDriver = await customerService.getPrimaryDriver(booking.id);

    const templateData: BookingConfirmationEmailParams = {
      bookingId: booking?.bookingCode || '',
      startDate: formatter.formatDateToFriendlyDate(booking?.startDate) || '',
      pickupTime: formatter.formatDateToFriendlyTime(booking?.startDate) || '',
      endDate: formatter.formatDateToFriendlyDate(booking?.endDate) || '',
      pickupLocation: booking?.pickup.location || '',
      totalPrice: formatter.formatNumberToTenantCurrency(
        booking?.values?.netTotal || 0,
        currency?.code || 'USD',
      ),
      tenantName: tenant?.tenantName || '',
      phone: tenant?.number || '',
      vehicle: formatter.formatVehicleToFriendly(booking?.vehicle) || '',
      email: tenant?.email || '',
      invoiceUrl: includeInvoice
        ? booking?.invoice?.invoiceUrl || ''
        : undefined,
      agreementUrl: includeAgreement
        ? booking?.agreement?.agreementUrl || ''
        : undefined,
    };

    await ses.sendEmail({
      to: [primaryDriver?.customer.email || ''],
      cc: [tenant?.email || ''],
      template: 'BookingConfirmation',
      templateData,
    });
  } catch (error) {
    logger.e(error, 'Error sending confirmation email', {
      bookingId,
      tenantId: tenant?.id,
      tenantCode: tenant?.tenantCode,
    });
    throw error;
  }
};

const newUserEmail = async (
  tenant: Tenant,
  userId: string,
  password: string,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const templateData = {
      tenantName: tenant?.tenantName,
      name: `${user?.firstName} ${user?.lastName}`,
      username: user?.username,
      password,
    };

    await ses.sendEmail({
      to: [user.email || ''],
      template: 'NewUser',
      templateData,
    });
  } catch (error) {
    logger.e(error, 'Error sending new user email', {
      userId,
      tenantId: tenant?.id,
      tenantCode: tenant?.tenantCode,
    });
    throw error;
  }
};

const resetPasswordEmail = async (
  tenant: Tenant,
  userId: string,
  password: string,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const templateData = {
      tenantName: tenant?.tenantName,
      name: `${user?.firstName} ${user?.lastName}`,
      username: user?.username,
      password,
    };

    await ses.sendEmail({
      to: [user.email || ''],
      template: 'PasswordReset',
      templateData,
    });
  } catch (error) {
    logger.e(error, 'Error sending reset password email', {
      userId,
      tenantId: tenant?.id,
      tenantCode: tenant?.tenantCode,
    });
    throw error;
  }
};

export default {
  sendConfirmationEmail,
  newUserEmail,
  resetPasswordEmail,
  sendWelcomeEmail,
};
