import { Request, Response } from 'express';
import { getZohoAccessToken } from '../config/zoho';
import axios from 'axios';
import prisma from '../config/prisma.config';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import FormData from 'form-data';
import loggerConfig from '../config/logger.config';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

const sendForSignature = async (req: Request, res: Response) => {
  const { rentalId, documentUrl, driverEmail, userId } = req.body;
  const tenantId = req.user?.tenantId;

  if (!rentalId || !documentUrl || !tenantId || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const accessToken = await getZohoAccessToken();

    const [driver, user] = await Promise.all([
      prisma.rentalDriver.findFirst({
        where: { rentalId },
        include: { customer: true },
      }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    const signatureResponse = await createDocument(
      documentUrl,
      driver,
      driverEmail,
      user,
      accessToken,
    );

    const sendResponse = await sendForSigning(
      signatureResponse.requests,
      accessToken,
    );

    return res.status(200).json(sendResponse);
  } catch (error: any) {
    console.error('Zoho Sign Error:', error.response?.data || error.message);

    res.status(500).json({
      error: 'Failed to send document for signing',
      details: error.message,
    });
  }
};

const createDocument = async (
  documentUrl: string,
  driver: any,
  driverEmail: string,
  user: any,
  accessToken: string,
): Promise<any> => {
  let tempFilePath: string | null = null;
  try {
    const urlParts = new URL(documentUrl);
    const bucket = urlParts.hostname.split('.')[0];
    const key = urlParts.pathname.substring(1);

    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    tempFilePath = path.join(tempDir, `${uuidv4()}.pdf`);
    const fileStream = fs.createWriteStream(tempFilePath);

    const s3Response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    if (s3Response.Body) {
      const bodyStream = s3Response.Body as Readable;
      await new Promise((resolve, reject) => {
        bodyStream.pipe(fileStream);
        bodyStream.on('error', reject);
        fileStream.on('finish', resolve);
      });
    } else {
      throw new Error('No file body received from S3');
    }

    const requestData = {
      requests: {
        request_name: 'Booking Agreement Signing Request',
        notes: 'Please sign this booking agreement',
        is_sequential: false,
        expiration_days: 30,
        actions: [
          {
            action_type: 'SIGN',
            recipient_name: `${driver.driver.firstName} ${driver.driver.lastName}`,
            recipient_email: driverEmail,
            in_person_name: `${driver.driver.firstName} ${driver.driver.lastName}`,
            verify_recipient: false,
            private_notes: 'Primary Driver',
          },
          {
            action_type: 'SIGN',
            recipient_name: `${user.firstName} ${user.lastName}`,
            recipient_email: `${user.email}`,
            in_person_name: `${user.firstName} ${user.lastName}`,
            verify_recipient: false,
            private_notes: 'Authorized Representative',
          },
        ],
      },
    };

    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempFilePath), {
      filename: 'Booking_Agreement.pdf',
      contentType: 'application/pdf',
    });
    formData.append('data', JSON.stringify(requestData));

    const response = await axios.post(
      'https://sign.zoho.com/api/v1/requests',
      formData,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          ...formData.getHeaders(),
        },
      },
    );

    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    loggerConfig.logger.info(
      `Zoho Sign Request Created: ${response.data.request_id}`,
    );

    return response.data;
  } catch (error: any) {
    loggerConfig.logger.error('Error creating Zoho Sign request:', error);

    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    throw error;
  }
};

const sendForSigning = async (data: any, accessToken: string) => {
  try {
    const requestId = data.request_id;

    const res = await axios.post(
      `https://sign.zoho.com/api/v1/requests/${requestId}/send`,
      data,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      },
    );

    return res.data;
  } catch (error) {
    loggerConfig.logger.error('Error sending for signature:', error);
  }
};

export default {
  sendForSignature,
};
