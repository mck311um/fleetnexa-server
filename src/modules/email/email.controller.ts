import { NextFunction, Request, Response } from 'express';
import { logger } from '../../config/logger';
import ses from '../../services/ses.service';
import { templates } from '../../config/templates';

const setupTemplates = async (req: Request, res: Response) => {
  try {
    const results = [];

    for (const template of templates) {
      try {
        logger.i(`Setting up template: ${template.name}`);
        const success = await ses.createOrUpdateEmailTemplate(template);

        results.push({
          template: template.name,
          success: success,
          message: success
            ? 'Template setup complete'
            : 'Template setup failed',
        });

        if (success) {
          logger.i(`✓ ${template.name} template setup complete`);
        } else {
          logger.i(`✗ ${template.name} template setup failed`);
        }
      } catch (error: unknown) {
        logger.e(error, `Failed to setup ${template.name}:`);
        results.push({
          template: template.name,
          success: false,
          message: `Error: ${(error as Error).message}`,
        });
      }
    }

    res.status(200).json({
      message: 'Template setup completed',
      results: results,
    });
  } catch (error) {
    logger.e(error, 'Template setup endpoint failed:');
  }
};

// const updateEmailTemplate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { body } = req.body as { body: EmailTemplateParams };
//   try {
//     const success = await service.updateEmailTemplate(body);
//     if (success) {
//       return res.status(200).json({ message: "Template updated successfully" });
//     }
//     return res.status(500).json({ message: "Failed to update template" });
//   } catch (error) {
//     next(error);
//   }
// };

// const sendConfirmationEmail = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { id } = req.params;
//   const tenantId = req.user?.tenantId;

//   if (!tenantId) {
//     logger.w("Tenant ID is missing", { tenantId });
//     return res.status(400).json({ error: "Tenant ID is required" });
//   }
//   if (!id) {
//     logger.w("Booking ID is missing", { id });
//     return res.status(400).json({ message: "BookingId is Required" });
//   }

//   try {
//     const tenant = await tenantRepo.getTenantById(tenantId!);
//     const booking = await rentalRepo.getRentalById(id, tenantId!);

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     const primaryDriver = await prisma.rentalDriver.findFirst({
//       where: {
//         rentalId: booking.id,
//         isPrimary: true,
//       },
//       select: { driverId: true, customer: { select: { email: true } } },
//     });

//     const templateData: BookingConfirmationEmailParams = {
//       bookingId: booking?.bookingCode || "",
//       startDate: formatter.formatDateToFriendlyDate(booking?.startDate) || "",
//       pickupTime: formatter.formatDateToFriendlyTime(booking?.startDate) || "",
//       endDate: formatter.formatDateToFriendlyDate(booking?.endDate) || "",
//       pickupLocation: booking?.pickup.location || "",
//       totalPrice: formatter.formatNumberToTenantCurrency(
//         booking?.values?.netTotal || 0,
//         tenant?.currency?.code || "USD"
//       ),
//       tenantName: tenant?.tenantName || "",
//       phone: tenant?.number || "",
//       vehicle: formatter.formatVehicleToFriendly(booking?.vehicle) || "",
//       email: tenant?.email || "",
//       invoiceUrl: booking?.invoice?.invoiceUrl || "",
//       agreementUrl: booking?.agreement?.agreementUrl || "",
//     };

//     await service.sendEmail({
//       to: [primaryDriver?.customer.email || ""],
//       cc: [tenant?.email || ""],
//       template: "BookingConfirmation",
//       templateData,
//     });

//     res.status(200).json({ message: "Confirmation email sent successfully" });
//   } catch (error) {
//     next(error);
//   }
// };

// const sendCompletionEmail = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { bookingId, tenantId } = req.body;

//   try {
//     if (!bookingId) {
//       return res.status(400).json({ message: "BookingId is Required" });
//     }

//     const tenant = await tenantRepo.getTenantById(tenantId!);

//     if (!tenant) {
//       logger.w("Tenant not found", { tenantId });
//       return res.status(404).json({ message: "Tenant not found" });
//     }

//     const booking = await rentalRepo.getRentalById(bookingId, tenantId!);

//     if (!booking) {
//       logger.w("Booking not found", { bookingId });
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     const primaryDriver = await prisma.rentalDriver.findFirst({
//       where: {
//         rentalId: booking.id,
//         primaryDriver: true,
//       },
//       select: { driverId: true, driver: { select: { email: true } } },
//     });

//     if (!primaryDriver) {
//       logger.w("Primary driver not found", { bookingId });
//       return res.status(404).json({ message: "Primary driver not found" });
//     }

//     const templateData: BookingCompletedEmailParams = {
//       bookingId: booking?.bookingCode || "",
//       startDate: formatter.formatDateToFriendlyDate(booking?.startDate) || "",
//       pickupTime: formatter.formatDateToFriendlyTime(booking?.startDate) || "",
//       endDate: formatter.formatDateToFriendlyDate(booking?.endDate) || "",
//       pickupLocation: booking?.pickup.location || "",
//       totalPrice: formatter.formatNumberToTenantCurrency(
//         booking?.values?.netTotal || 0,
//         tenant?.currency?.code || "USD"
//       ),
//       tenantName: tenant?.tenantName || "",
//       phone: tenant?.number || "",
//       vehicle: formatter.formatVehicleToFriendly(booking?.vehicle) || "",
//       email: tenant?.email || "",
//     };

//     await service.sendEmail({
//       to: [primaryDriver.driver.email!],
//       cc: [tenant?.email!],
//       from: "no-reply@rentnexa.com",
//       template: "BookingCompleted",
//       templateData,
//     });

//     logger.i("Completion email sent successfully", {
//       bookingId,
//       bookingCode: booking.bookingCode,
//       tenantId: tenant?.id,
//       tenantCCode: tenant?.tenantCode,
//     });

//     res.status(200).json({ message: "Completion email sent successfully" });
//   } catch (error) {
//     next(error);
//   }
// };

export default {
  setupTemplates,
};
