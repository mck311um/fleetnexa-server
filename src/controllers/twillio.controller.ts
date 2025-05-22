const twilio = require("twilio");
import { rentalRepo } from "../repository/rental.repository";
import { vehicleRepo } from "../repository/vehicle.repository";
import prisma from "../config/prisma.config";
import { Request, Response, NextFunction } from "express";

const accountSid = process.env.TWILLIO_ACCOUNT_SID || "";
const authToken = process.env.TWILLIO_AUTH_TOKEN || "";
const client = twilio(accountSid, authToken);

interface Document {
  documentUrl: string;
  documentType: string;
  filename?: string;
}

interface WhatsAppNotificationBody {
  to: string;
  rentalId: string;
  documents?: Document[];
  message?: string;
}

const sendWhatsAppNotification = async (req: any, res: any) => {
  const { to, body } = req.body;

  try {
    const message = await client.messages.create({
      body,
      from: "whatsapp:+14155238886",
      to: `whatsapp:${to}`,
    });

    res.status(200).json({
      message: "WhatsApp message sent successfully",
      sid: message.sid,
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    res.status(500).json({ message: "Failed to send WhatsApp message", error });
  }
};

const sendDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req.body as { body: WhatsAppNotificationBody };
  const tenantId = req.user?.tenantId;

  try {
    if (!body.to || !body.rentalId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const rental = await rentalRepo.getRentalById(body.rentalId, tenantId!);
    const vehicle = await vehicleRepo.getVehicleById(
      rental?.vehicleId!,
      tenantId!
    );
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    const pickupTime = rental?.startDate
      ? new Date(rental.startDate).toLocaleString()
      : "N/A";
    const returnTime = rental?.endDate
      ? new Date(rental.endDate).toLocaleString()
      : "N/A";

    const vehicleDescription = `${vehicle?.year} ${vehicle?.brand?.brand} ${vehicle?.model?.model}`;

    const documentLinks = body.documents?.length
      ? "\n\n*Documents:*\n" +
        body.documents
          .map((doc) => `- ${doc.documentType}: ${doc.documentUrl}`)
          .join("\n")
      : "";

    const whatsappBody = `
${body.message || "Your rental details:"}

*Vehicle:* ${vehicleDescription}
*Color:* ${vehicle?.color}
*Pickup:* ${pickupTime}
*Return:* ${returnTime}
*Location:* ${rental?.pickup.location}

Thank you for choosing ${tenant?.tenantName}!
    `.trim();

    const textMessage = await client.messages.create({
      body: whatsappBody,
      from: "whatsapp:+14155238886",
      to: `whatsapp:${body.to}`,
    });

    const mediaResults = await Promise.allSettled(
      (body.documents || []).map((doc) =>
        client.messages.create({
          mediaUrl: [doc.documentUrl],
          from: "whatsapp:+14155238886",
          to: `whatsapp:${body.to}`,
          body: `*${doc.documentType}*`,
        })
      )
    );

    const failedDocs = mediaResults
      .map((res, i) =>
        res.status === "rejected" ? body.documents?.[i].documentType : null
      )
      .filter(Boolean);

    res.status(200).json({
      success: true,
      message: "WhatsApp notification with documents sent",
      sid: textMessage.sid,
      documentsSent: body.documents?.map((d) => d.documentType) || [],
      failedDocuments: failedDocs,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  sendWhatsAppNotification,
  sendDocuments,
};
