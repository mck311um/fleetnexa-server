import { NextFunction, Request, Response } from "express";
import { Resend } from "resend";

import { tenantRepo } from "../repository/tenant.repository";
import { rentalRepo } from "../repository/rental.repository";
import { vehicleRepo } from "../repository/vehicle.repository";
import prisma from "../config/prisma.config";
import service from "../services/ses.service";
import {
  BookingCompletedEmailParams,
  BookingConfirmationEmailParams,
  EmailTemplateParams,
} from "../types/email";
import { logger } from "../config/logger.config";
import emailService from "../services/ses.service";
import formatter from "../utils/formatter";

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

const createEmailTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req.body as { body: EmailTemplateParams };
  try {
    const success = await service.createEmailTemplate(body);
    if (success) {
      return res.status(201).json({ message: "Template created successfully" });
    }
    return res.status(500).json({ message: "Failed to create template" });
  } catch (error) {
    next(error);
  }
};

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
    ];

    const results = [];

    for (const template of templates) {
      try {
        logger.info(`Setting up template: ${template.name}`);
        const success = await service.createOrUpdateEmailTemplate(template);

        results.push({
          template: template.name,
          success: success,
          message: success
            ? "Template setup complete"
            : "Template setup failed",
        });

        if (success) {
          logger.info(`✓ ${template.name} template setup complete`);
        } else {
          logger.warn(`✗ ${template.name} template setup failed`);
        }
      } catch (error: any) {
        logger.error(`Failed to setup ${template.name}:`, error);
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
    logger.error("Template setup endpoint failed:", error);
    next(error);
  }
};

const updateEmailTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req.body as { body: EmailTemplateParams };
  try {
    const success = await service.updateEmailTemplate(body);
    if (success) {
      return res.status(200).json({ message: "Template updated successfully" });
    }
    return res.status(500).json({ message: "Failed to update template" });
  } catch (error) {
    next(error);
  }
};

const sendConfirmationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookingId = req.params.bookingId;
  const tenantId = req.user?.tenantId;
  const userId = req.user?.id;

  try {
    if (!bookingId) {
      return res.status(400).json({ message: "BookingId is Required" });
    }

    const tenant = await tenantRepo.getTenantById(tenantId!);
    const booking = await rentalRepo.getRentalById(bookingId, tenantId!);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const primaryDriver = await prisma.rentalDriver.findFirst({
      where: {
        rentalId: booking.id,
        isPrimary: true,
      },
      select: { driverId: true, customer: { select: { email: true } } },
    });

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

    await emailService.sendEmail({
      to: [primaryDriver?.customer.email || ""],
      cc: [tenant?.email || ""],
      template: "BookingConfirmation",
      templateData,
    });

    res.status(200).json({ message: "Confirmation email sent successfully" });
  } catch (error) {
    next(error);
  }
};

const sendCompletionEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { bookingId, tenantId } = req.body;

  try {
    if (!bookingId) {
      return res.status(400).json({ message: "BookingId is Required" });
    }

    const tenant = await tenantRepo.getTenantById(tenantId!);
    const booking = await rentalRepo.getRentalById(bookingId, tenantId!);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const primaryDriver = await prisma.rentalDriver.findFirst({
      where: {
        rentalId: booking.id,
        isPrimary: true,
      },
      select: { driverId: true, customer: { select: { email: true } } },
    });

    const templateData: BookingCompletedEmailParams = {
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
    };

    await emailService.sendEmail({
      to: [primaryDriver?.customer.email || ""],
      cc: [tenant?.email || ""],
      from: "no-reply@rentnexa.com",
      template: "BookingCompleted",
      templateData,
    });

    res.status(200).json({ message: "Completion email sent successfully" });
  } catch (error) {
    next(error);
  }
};

export default {
  setupTemplates,
  sendConfirmationEmail,
  sendCompletionEmail,
  createEmailTemplate,
  updateEmailTemplate,
};
