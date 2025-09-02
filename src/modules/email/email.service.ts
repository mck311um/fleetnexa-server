import { TxClient } from "../../config/prisma.config";
import { BookingConfirmationEmailParams } from "../../types/email";
import formatter from "../../utils/formatter";
import ses from "../../services/ses.service";
import { logger } from "../../config/logger";
import customerService from "../customer/customer.service";

const sendConfirmationEmail = async (
  bookingId: string,
  tenant: any,
  tx: TxClient
) => {
  try {
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
      throw new Error("Booking not found");
    }

    const primaryDriver = await customerService.getPrimaryDriver(
      booking.id,
      tx
    );

    const templateData: BookingConfirmationEmailParams = {
      bookingId: booking?.bookingCode || "",
      startDate: formatter.formatDateToFriendlyDate(booking?.startDate) || "",
      pickupTime: formatter.formatDateToFriendlyTime(booking?.startDate) || "",
      endDate: formatter.formatDateToFriendlyDate(booking?.endDate) || "",
      pickupLocation: booking?.pickup.location || "",
      totalPrice: formatter.formatNumberToTenantCurrency(
        booking?.values?.netTotal || 0,
        tenant?.currency?.code || "USD"
      ),
      tenantName: tenant?.tenantName || "",
      phone: tenant?.number || "",
      vehicle: formatter.formatVehicleToFriendly(booking?.vehicle) || "",
      email: tenant?.email || "",
      invoiceUrl: booking?.invoice?.invoiceUrl || "",
      agreementUrl: booking?.agreement?.agreementUrl || "",
    };

    await ses.sendEmail({
      to: [primaryDriver?.customer.email || ""],
      cc: [tenant?.email || ""],
      template: "BookingConfirmation",
      templateData,
    });
  } catch (error) {
    logger.e(error, "Error sending confirmation email", {
      bookingId,
      tenantId: tenant?.id,
      tenantCode: tenant?.code,
    });
    throw error;
  }
};

export default {
  sendConfirmationEmail,
};
