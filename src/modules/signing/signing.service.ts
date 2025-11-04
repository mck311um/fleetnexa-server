import { Tenant, User } from '@prisma/client';
import prisma from '../../config/prisma.config';
import { customerService } from '../customer/customer.service';
import { firmaService } from '../../services/firma.service';
import { logger } from '../../config/logger';
import { SendAgreementForSigningDto } from './signing.dto';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../config/aws.config';
import { PDFDocument } from 'pdf-lib';

class SigningService {
  async sendAgreementForSigning(
    data: SendAgreementForSigningDto,
    tenant: Tenant,
  ) {
    try {
      const existingBooking = await prisma.rental.findUnique({
        where: { id: data.bookingId },
        include: { agreement: true },
      });

      if (!existingBooking) {
        throw new Error('Booking not found');
      }

      const primaryDriver = await customerService.getPrimaryDriver(
        data.bookingId,
      );

      if (!existingBooking.agreement?.agreementUrl) {
        throw new Error('Agreement URL not found for the booking');
      }

      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const s3Key =
        existingBooking.agreement.signableUrl!.split('.amazonaws.com/')[1];

      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: s3Key,
      });
      const s3Response = await s3Client.send(command);
      const buffer = await this.streamToBuffer(s3Response.Body);
      const base64PDF = buffer.toString('base64');

      const pdfDoc = await PDFDocument.load(buffer);
      const totalPages = pdfDoc.getPageCount();

      const documentData = {
        name: `Booking Agreement - ${existingBooking.bookingCode}`,
        document: base64PDF,
        description: 'Booking Agreement Document',
        settings: {
          use_signing_order: false,
          allow_download: true,
          attach_pdf_on_finish: true,
        },
        recipients: [
          {
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            designation: 'Signer',
            order: 1,
          },
          {
            first_name: primaryDriver.customer.firstName,
            last_name: primaryDriver.customer.lastName,
            email: data.driverEmail,
            designation: 'Signer',
            order: 2,
          },
        ],
        fields: [
          {
            type: 'signature',
            position: {
              x: 40,
              y: 290,
              width: 50,
              height: 100,
            },
            page_number: totalPages,
            required: true,
          },
          {
            type: 'signature',
            position: {
              x: 320,
              y: 290,
              width: 50,
              height: 100,
            },
            page_number: totalPages,
            required: true,
          },
        ],
      };

      logger.i('Sending agreement for signing', { documentData });

      const res = await firmaService.createSigningRequest(documentData);

      logger.i(`Agreement sent for signing successfully`, { res });
    } catch (error) {
      logger.e(error, 'Error sending agreement for signing', {
        bookingId: data.bookingId,
        tenantId: tenant.id,
      });
      throw error;
    }
  }

  private async streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      stream.on('data', (chunk: any) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}

export const signingService = new SigningService();
