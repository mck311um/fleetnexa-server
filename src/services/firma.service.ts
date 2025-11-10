import axios from 'axios';
import { logger } from '../config/logger';
import { pdfService } from './pdf.service';

const FIRMA_BASE_URL =
  'https://api.firma.dev/functions/v1/signing-request-api/';
const FIRMA_API_KEY = process.env.FIRMA_API_KEY;

class FirmaService {
  client: any;

  constructor() {
    this.client = axios.create({
      baseURL: FIRMA_BASE_URL,
      headers: {
        Authorization: `${FIRMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async sendS3DocumentForSigning(
    bucketName: string,
    key: string,
    recipientEmail: string,
  ) {
    const presignedUrl = await pdfService.getPresignedURL(bucketName, key);

    const documentData = {
      documents: [
        {
          name: key,
          url: presignedUrl,
        },
      ],
      signers: [
        {
          name: recipientEmail.split('@')[0],
          email: recipientEmail,
          role: 'signer',
        },
      ],
      title: 'Please sign this document',
      message: 'Kindly review and sign the attached agreement.',
    };

    const response = await this.createSigningRequest(documentData);
    return response;
  }

  async createSigningRequest(documentData: any) {
    try {
      const response = await this.client.post('signing-requests', documentData);
      return response.data;
    } catch (error) {
      logger.e(error, 'Error creating signing request', {});
      throw error;
    }
  }
}

export const firmaService = new FirmaService();
