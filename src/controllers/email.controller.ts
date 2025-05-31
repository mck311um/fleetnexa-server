import { NextFunction, Request, Response } from "express";
import { Resend } from "resend";
import logUtil from "../config/logger.config";
import { PrismaClient } from "@prisma/client";
import { tenantRepo } from "../repository/tenant.repository";
import { rentalRepo } from "../repository/rental.repository";
import { vehicleRepo } from "../repository/vehicle.repository";
import prisma from "../config/prisma.config";
import { rentalDocumentsEmail } from "../templates/rentalEmail.template";

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
  sendDocuments,
};
