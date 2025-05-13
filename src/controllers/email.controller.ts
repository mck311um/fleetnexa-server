import e, { Request, Response } from "express";
import { Resend } from "resend";
import errorUtil from "../utils/error.util";

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

  try {
    if (!body.documents || !body.documents.length || !body.recipientEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

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

    const { data, error } = await resend.emails.send({
      from: `${body.senderName} <${localSenderName}@fleetnexa.com>`,
      to: body.recipientEmail,
      cc: body.senderEmail,
      subject,
      text:
        body.message ||
        `Please find attached the following documents for your booking:\n${documentList}`,
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
    errorUtil.handleError(res, error, "sending document");
  }
};

export default {
  sendDocuments,
};
