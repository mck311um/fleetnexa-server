import { NextFunction, Request, Response } from "express";
import { getZohoAccessToken } from "../config/zoho";
import axios from "axios";
import prisma from "../config/prisma.config";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import FormData from "form-data";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

const sendForSignature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { rentalId, documentUrl } = req.body;
  const tenantId = req.user?.tenantId;
  const userId = req.user?.id;
  let tempFilePath: string | null = null;

  // Validate required fields
  if (!rentalId || !documentUrl || !tenantId || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const accessToken = await getZohoAccessToken();

    // Fetch all required data
    const [driver, user, tenant] = await Promise.all([
      prisma.rentalDriver.findFirst({
        where: { rentalId },
        include: { driver: true },
      }),
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.tenant.findUnique({ where: { id: tenantId } }),
    ]);

    // Validate data
    if (!driver?.driver) {
      return res
        .status(404)
        .json({ error: "Driver not found for this rental" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    if (!tenant.email) {
      return res.status(400).json({ error: "Tenant email is required" });
    }

    // Extract S3 bucket and key from the documentUrl
    const urlParts = new URL(documentUrl);
    const bucket = urlParts.hostname.split(".")[0];
    const key = urlParts.pathname.substring(1);

    // Download file from S3
    const tempDir = path.join(__dirname, "..", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    tempFilePath = path.join(tempDir, `${uuidv4()}.pdf`);
    const fileStream = fs.createWriteStream(tempFilePath);

    const s3Response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    // Handle AWS SDK v3 streaming response
    if (s3Response.Body) {
      const bodyStream = s3Response.Body as Readable;
      await new Promise((resolve, reject) => {
        bodyStream.pipe(fileStream);
        bodyStream.on("error", reject);
        fileStream.on("finish", resolve);
      });
    } else {
      throw new Error("No file body received from S3");
    }

    // Prepare the request payload
    const requestData = {
      requests: {
        request_name: "Booking Agreement Signing Request",
        notes: "Please sign this booking agreement",
        is_sequential: false,
        expiration_days: 30,
        actions: [
          {
            action_type: "SIGN",
            recipient_name: `${driver.driver.firstName} ${driver.driver.lastName}`,
            recipient_email: driver.driver.email,
            in_person_name: `${user.firstName} ${user.lastName}`,
            verify_recipient: false,
            private_notes: "Primary signer",
          },
          {
            action_type: "SIGN",
            recipient_name: `${user.firstName} ${user.lastName}`,
            recipient_email: tenant.email,
            in_person_name: `${user.firstName} ${user.lastName}`,
            verify_recipient: false,
            private_notes: "Secondary signer",
          },
        ],
      },
    };

    // Create FormData for the request
    const formData = new FormData();
    formData.append("file", fs.createReadStream(tempFilePath), {
      filename: "Booking_Agreement.pdf",
      contentType: "application/pdf",
    });
    formData.append("data", JSON.stringify(requestData));

    const response = await axios.post(
      "https://sign.zoho.com/api/v1/requests",
      formData,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          ...formData.getHeaders(),
        },
      }
    );

    // Clean up the temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    return res.status(200).json({
      message: "Document sent for signature successfully",
      data: response.data,
    });
  } catch (error: any) {
    console.error("Zoho Sign Error:", error.response?.data || error.message);

    // Clean up temporary file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    // More specific error handling
    if (error.response?.data?.code === 4002) {
      return res.status(400).json({
        error: "Invalid request data",
        details: error.response.data.message,
        invalid_fields: error.response.data.invalid_fields,
      });
    }

    res.status(500).json({
      error: "Failed to send document for signing",
      details: error.message,
    });
  }
};

export default {
  sendForSignature,
};
