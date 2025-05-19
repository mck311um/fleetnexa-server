import e, { Request, Response } from "express";
import { Resend } from "resend";
import logUtil from "../config/logger.config";
import { PrismaClient } from "@prisma/client";
import { tenantService } from "../repository/tenant.repository";

const prisma = new PrismaClient();

const resend = new Resend(process.env.RESEND_API_KEY!);

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
  bookingId: string;
  message?: string;
}

const sendDocuments = async (req: Request, res: Response) => {
  const { body } = req.body as { body: SendDocumentBody };
  const tenantId = req.user?.tenantId;
  const userId = req.user?.id;

  try {
    if (!body.documents || !body.documents.length || !body.recipientEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const tenant = await tenantService.getTenantById(tenantId!);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    const documentAttachments = await Promise.all(
      body.documents.map(async (doc) => {
        const response = await fetch(doc.documentUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${doc.documentType}`);
        }

        const fileBuffer = await response.arrayBuffer();
        const filename =
          doc.filename || `${doc.documentType}_${body.bookingId}.pdf`;

        return {
          filename,
          content: Buffer.from(fileBuffer),
        };
      })
    );

    const subject =
      body.documents.length > 1
        ? `Documents for Vehicle Booking`
        : `${body.documents[0].documentType} for Vehicle Booking`;

    const documentList = body.documents
      .map((doc) => `- ${doc.documentType}`)
      .join("\n");

    const localSenderName = body.senderName.replace(/\s+/g, "").toLowerCase();
    const emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto;">
      <p style="font-size: 16px;">Good Day,</p>
  
      <p style="font-size: 16px;">
        ${body.message || "Please find your booking documents attached for your recent vehicle reservation."}
      </p>
  
      <div style="margin: 20px 0;">
        <strong style="font-size: 16px;">Attached Documents:</strong>
        <ul style="font-size: 15px; line-height: 1.6; padding-left: 20px;">
          ${body.documents
            .map((doc) => `<li>${doc.documentType}</li>`)
            .join("")}
        </ul>
      </div>
  
      <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;" />
  
      <div style="font-size: 14px; line-height: 1.6;">
        <p>Best regards,</p>
        <p>
          ${user?.firstName} ${user?.lastName}<br />
          ${tenant?.tenantName}<br />
          <a href="mailto:${tenant?.email}" style="color: #1a73e8;">${tenant?.email}</a><br />
          ${tenant?.number}
        </p>
      </div>
  
      <div style="text-align: center; margin: 30px 0;">
        <img src="${tenant?.logo}" alt="${tenant?.tenantName} Logo" style="max-height: 50px; display: inline-block;" />
      </div>
  
      <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;" />
  
      <p style="font-size: 13px; text-align: center; color: #888;">
        Powered by <strong>FleetNexa™</strong> — Smarter Vehicle Rentals
      </p>
    </div>
  `;

    const { data, error } = await resend.emails.send({
      from: `${body.senderName} <${localSenderName}@fleetnexa.com>`,
      to: body.recipientEmail,
      // bcc: body.senderEmail,
      subject,
      html: emailContent,
      attachments: documentAttachments,
    });

    if (error) {
      throw new Error(error.message);
    }

    res.json({
      success: true,
      message: "Documents sent successfully",
      data,
      documentsSent: body.documents.map((doc) => doc.documentType),
    });
  } catch (error) {
    logUtil.handleError(res, error, "sending document");
  }
};

export default {
  sendDocuments,
};
