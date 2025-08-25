import { NextFunction, Request, Response } from "express";
import { Resend } from "resend";

import { tenantRepo } from "../repository/tenant.repository";
import { rentalRepo } from "../repository/rental.repository";
import { vehicleRepo } from "../repository/vehicle.repository";
import prisma from "../config/prisma.config";
import { rentalDocumentsEmail } from "../templates/rentalEmail.template";
import service from "../services/email.service";
import { EmailTemplateParams } from "../types/email";
import { logger } from "../config/logger.config";

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

const sendDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const resend = new Resend(process.env.RESEND_API_KEY || "");
  const { body } = req.body as { body: SendDocumentBody };
  const tenantId = req.user?.tenantId;
  const userId = req.user?.id;

  try {
    if (!body.documents || !body.documents.length || !body.recipientEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const tenant = await tenantRepo.getTenantById(tenantId!);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
      },
    });
    const rental = await rentalRepo.getRentalById(body.rentalId, tenantId!);
    const vehicle = await vehicleRepo.getVehicleById(
      rental?.vehicleId!,
      tenantId!
    );

    const documentAttachments = await Promise.all(
      body.documents.map(async (doc) => {
        const response = await fetch(doc.documentUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${doc.documentType}`);
        }

        const fileBuffer = await response.arrayBuffer();
        const filename =
          doc.filename || `${doc.documentType}_${rental?.rentalNumber}.pdf`;

        return {
          filename,
          content: Buffer.from(fileBuffer),
        };
      })
    );

    const vehicleDescription = `${vehicle?.year} ${vehicle?.brand?.brand} ${vehicle?.model?.model} - ${vehicle?.color}`;

    const subject =
      body.documents.length > 1
        ? `Documents for Vehicle Rental`
        : `${body.documents[0].documentType} for Vehicle Rental`;

    const documentList = body.documents
      .map((doc) => `- ${doc.documentType}`)
      .join("\n");

    const localSenderName = body.senderName.replace(/\s+/g, "").toLowerCase();
    const emailHtml = rentalDocumentsEmail({
      message: body.message,
      vehicleDescription,
      rental,
      documents: body.documents,
      user: {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
      },
      tenant: {
        tenantName: tenant?.tenantName || "",
        email: tenant?.email || "",
        number: tenant?.number || "",
        logo: tenant?.logo || "",
      },
    });

    const { data, error } = await resend.emails.send({
      from: `${body.senderName} <${localSenderName}@fleetnexa.com>`,
      to: body.recipientEmail,
      // cc: body.senderEmail,
      subject,
      html: emailHtml,
      attachments: documentAttachments,
    });

    if (error) {
      throw new Error(error.message);
    }

    res.json({
      success: true,
      message: "Documents sent successfully",
      data,
      documentsSent: body.documents.map((doc: any) => doc.documentType),
    });
  } catch (error) {
    next(error);
  }
};

export default {
  setupTemplates,
  sendDocuments,
  createEmailTemplate,
  updateEmailTemplate,
};
