import { TxClient } from '../../config/prisma.config';
import {
  BookingConfirmationEmailParams,
  WelcomeEmailParams,
} from '../../types/email';
import formatter from '../../utils/formatter';
import ses from '../../services/ses.service';
import { logger } from '../../config/logger';
import customerService from '../customer/customer.service';
import { Tenant } from '@prisma/client';

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
  tenant: Tenant | null,
  tx: TxClient,
) => {
  try {
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const currency = await tx.currency.findUnique({
      where: { id: tenant.currencyId! },
    });

    const booking = await tx.rental.findUnique({
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

    const primaryDriver = await customerService.getPrimaryDriver(
      booking.id,
      tx,
    );

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
      invoiceUrl: booking?.invoice?.invoiceUrl || '',
      agreementUrl: booking?.agreement?.agreementUrl || '',
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
  tx: TxClient,
) => {
  try {
    const user = await tx.user.findUnique({
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
  tx: TxClient,
) => {
  try {
    const user = await tx.user.findUnique({
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
