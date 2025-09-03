import { NextFunction, Request, Response } from "express";
import {
  BookingCompletedEmailParams,
  BookingConfirmationEmailParams,
  EmailTemplateParams,
} from "../../types/email";
import service from "./email.service";
import { logger } from "../../config/logger";
import { tenantRepo } from "../../repository/tenant.repository";
import { rentalRepo } from "../../repository/rental.repository";
import prisma from "../../config/prisma.config";
import formatter from "../../utils/formatter";
import ses from "../../services/ses.service";

interface Document {
  documentUrl: string;
  documentType: string;
  filename?: string;
}

interface SendDocumentBody {
  documents: Document[];
  recipientEmail: string;
  senderName: string;
  senderEmail?: string;
  rentalId: string;
  message?: string;
}

const setupTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const templates = [
      {
        name: "WelcomeTemplate",
        subject: "Welcome to FleetNexa!",
        text: "Welcome {{name}}!\n\nThank you for joining FleetNexa.\n\nYour account:\nCompany: {{tenantName}}\nUsername: {{username}}\nPassword: {{password}}\n\nPlease change your password immediately after first login.\n\nBest regards,\nFleetNexa Team",
      },
      {
        name: "BookingConfirmation",
        subject: "Booking Confirmation",
        text: "Booking Confirmed!\n\nYour reservation has been successfully completed.\n\nBooking Details:\nBooking ID: {{bookingId}}\nStart Date: {{startDate}}\nEnd Date: {{endDate}}\nPickup Location: {{pickupLocation}}\nTotal Price: {{totalPrice}}\n\nRental Company:\nCompany: {{tenantName}}\nPhone: {{phone}}\nEmail: {{email}}\n\nImportant Notes:\n- Please bring a valid driver's license\n- Arrive 15 minutes before your scheduled pickup time\n- Contact the rental company if you need to make any changes with your booking ID\n\n© 2025 Devvize Services. All rights reserved.\nNeed help? Contact our team at support@devvize.com",
      },
      {
        name: "BookingCompleted",
        subject: "Booking Completed",
        text: "Booking Completed!\n\nYour reservation has been successfully completed.\n\nBooking Details:\nBooking ID: {{bookingId}}\nStart Date: {{startDate}}\nEnd Date: {{endDate}}\nPickup Location: {{pickupLocation}}\nTotal Price: {{totalPrice}}\n\nRental Company:\nCompany: {{tenantName}}\nPhone: {{phone}}\nEmail: {{email}}\n\nImportant Notes:\n- Please bring a valid driver's license\n- Arrive 15 minutes before your scheduled pickup time\n- Contact the rental company if you need to make any changes with your booking ID\n\n© 2025 Devvize Services. All rights reserved.\nNeed help? Contact our team at support@devvize.com",
      },
      {
        name: "NewUser",
        subject: "User Created",
        text: "New System User Account Created!\n\nA system user account has been created for you in FleetNexa.\n\nAccount Details:\nCompany: {{tenantName}}\nName: {{name}}\nUsername: {{username}}\nPassword: {{password}}\n\nLogin URL: https://app.fleetnexa.com/login\n\nSecurity Notice:\n- You must change your password immediately after first login\n- This account provides access to sensitive system functions\n- Protect your credentials and never share them with others\n\nFor technical support or access issues, contact our IT team at it-support@devvize.com\n\n© 2025 Devvize Services. All rights reserved.",
      },
      {
        name: "PasswordReset",
        subject: "Your FleetNexa Password Has Been Reset",
        text: "Password Reset Notification\n\nYour FleetNexa password has been reset as requested.\n\nLogin Details:\nUsername: {{username}}\nTemporary Password: {{password}}\n\nLogin URL: https://app.fleetnexa.com/login\n\nImportant Security Notice:\n- You must change this temporary password immediately after logging in\n- This temporary password will expire in 24 hours\n\nIf you didn't request this password reset, please contact our security team immediately at security@devvize.com\n\n© 2025 Devvize Services. All rights reserved.",
      },
    ];

    const results = [];

    for (const template of templates) {
      try {
        logger.i(`Setting up template: ${template.name}`);
        const success = await ses.createOrUpdateEmailTemplate(template);

        results.push({
          template: template.name,
          success: success,
          message: success
            ? "Template setup complete"
            : "Template setup failed",
        });

        if (success) {
          logger.i(`✓ ${template.name} template setup complete`);
        } else {
          logger.i(`✗ ${template.name} template setup failed`);
        }
      } catch (error: any) {
        logger.e(error, `Failed to setup ${template.name}:`);
        results.push({
          template: template.name,
          success: false,
          message: `Error: ${error.message}`,
        });
      }
    }

    res.status(200).json({
      message: "Template setup completed",
      results: results,
    });
  } catch (error) {
    logger.e(error, "Template setup endpoint failed:");
    next(error);
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
