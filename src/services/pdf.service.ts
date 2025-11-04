import axios from 'axios';
import { AgreementData, InvoiceData } from '../types/pdf';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { PDFDocument } from 'pdf-lib';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class PDFService {
  async getPDFFromS3(bucketName: string, key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const response = await s3Client.send(command);
      return (await this.streamToBuffer(response.Body)) as Buffer;
    } catch (error) {
      console.error('Error fetching PDF from S3:', error);
      throw error;
    }
  }

  async getPresignedURL(bucketName: string, key: string, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  }

  async streamToBuffer(stream: any) {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async getPDFAsBase64(bucketName: string, key: string) {
    const pdfBuffer = await this.getPDFFromS3(bucketName, key);
    return pdfBuffer.toString('base64');
  }
}

export const pdfService = new PDFService();

const apiKey = process.env.PDFMONKEY_API_KEY!;
const invoiceId = process.env.PDFMONKEY_INVOICE_ID!;
const agreementId = process.env.PDFMONKEY_AGREEMENT_ID!;
const awsBucketName = process.env.AWS_BUCKET_NAME!;

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const pdfMonkeyApi = axios.create({
  baseURL: 'https://api.pdfmonkey.io/api/v1',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

type DocumentType = 'invoice' | 'agreement';

interface CreateDocumentParams {
  data: InvoiceData | AgreementData;
  documentType: DocumentType;
  documentNumber: string;
  tenantCode: string;
}

const createDocument = async ({
  data,
  documentType,
  documentNumber,
  tenantCode,
}: CreateDocumentParams) => {
  const templateId = documentType === 'invoice' ? invoiceId : agreementId;
  const folder = documentType === 'invoice' ? 'Invoices' : 'Agreements';

  try {
    const res = await pdfMonkeyApi.post('/documents', {
      document: {
        document_template_id: templateId,
        payload: data,
        status: 'pending',
        meta: {
          _filename: `${documentNumber}.pdf`,
        },
      },
    });

    const document = res.data.document;
    const documentId = document.id;

    if (!documentId) {
      throw new Error('Document ID not found in response');
    }

    const documentDetails = await waitForDocumentGeneration(documentId);
    const pdfBuffer = await downloadPdf(
      documentDetails.data.document.download_url,
    );

    const s3Key = `Tenants/${tenantCode}/${folder}/${documentNumber}.pdf`;
    const publicUrl = await uploadToS3(pdfBuffer, s3Key);

    if (documentType === 'agreement') {
      const additionalPageUrl =
        'https://fleetnexa.s3.us-east-1.amazonaws.com/Global+Images/BookingAgreementPage.pdf';
      const additionalPageBuffer = await downloadPdf(additionalPageUrl);

      const signablePdfBuffer = await replaceLastPage(
        pdfBuffer,
        additionalPageBuffer,
      );

      const signableS3Key = `Tenants/${tenantCode}/${folder}/${documentNumber}_signable.pdf`;
      const signablePublicUrl = await uploadToS3(
        signablePdfBuffer,
        signableS3Key,
      );

      return {
        s3Key,
        documentId,
        publicUrl,
        signableS3Key,
        signablePublicUrl,
      };
    }

    return { s3Key, documentId, publicUrl };
  } catch (error) {
    console.error(`Error creating ${documentType}:`, error);
    throw new Error(`Failed to create ${documentType}`);
  }
};

const waitForDocumentGeneration = async (
  documentId: string,
  maxAttempts = 10,
) => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const documentDetails = await pdfMonkeyApi.get(`/documents/${documentId}`);
    const status = documentDetails.data.document.status;

    if (status === 'success') return documentDetails;
    if (status === 'failed') throw new Error('PDF generation failed');
  }

  throw new Error('PDF generation timed out');
};

const downloadPdf = async (downloadUrl: string) => {
  const pdfResponse = await axios.get(downloadUrl, {
    responseType: 'arraybuffer',
  });
  return Buffer.from(pdfResponse.data, 'binary');
};

const uploadToS3 = async (pdfBuffer: Buffer, s3Key: string) => {
  const uploadParams = {
    Bucket: awsBucketName,
    Key: s3Key,
    Body: pdfBuffer,
    ContentType: 'application/pdf',
  };
  await s3Client.send(new PutObjectCommand(uploadParams));

  return `https://${awsBucketName}.s3.amazonaws.com/${s3Key}`;
};

const createInvoice = async (
  invoiceData: InvoiceData,
  invoiceNumber: string,
  tenantCode: string,
) => {
  const { s3Key, documentId, publicUrl } = await createDocument({
    data: invoiceData,
    documentType: 'invoice',
    documentNumber: invoiceNumber,
    tenantCode,
  });
  return { s3Key, documentId, publicUrl };
};

const createAgreement = async (
  agreementData: AgreementData,
  agreementNumber: string,
  tenantCode: string,
) => {
  const { s3Key, documentId, publicUrl, signablePublicUrl } =
    await createDocument({
      data: agreementData,
      documentType: 'agreement',
      documentNumber: agreementNumber,
      tenantCode,
    });
  return { s3Key, documentId, publicUrl, signablePublicUrl };
};

const replaceLastPage = async (
  originalPdfBuffer: Buffer,
  newPageBuffer: Buffer,
) => {
  try {
    const originalPdfDoc = await PDFDocument.load(originalPdfBuffer);
    const newPagePdfDoc = await PDFDocument.load(newPageBuffer);

    const pageIndices = Array.from(
      { length: originalPdfDoc.getPageCount() - 1 },
      (_, i) => i,
    );
    const newPdfDoc = await PDFDocument.create();

    const pages = await newPdfDoc.copyPages(originalPdfDoc, pageIndices);
    pages.forEach((page) => newPdfDoc.addPage(page));

    const [newLastPage] = await newPdfDoc.copyPages(newPagePdfDoc, [0]);
    newPdfDoc.addPage(newLastPage);

    const mergedPdfBytes = await newPdfDoc.save();
    return Buffer.from(mergedPdfBytes);
  } catch (error) {
    console.error('Error replacing last PDF page:', error);
    throw new Error('Failed to replace last page');
  }
};

// const mergeDocuments = async (
//   mainPdfBuffer: Buffer,
//   additionalPdfBuffer: Buffer,
// ) => {
//   try {
//     const mainPdfDoc = await PDFDocument.load(mainPdfBuffer);
//     const additionalPdfDoc = await PDFDocument.load(additionalPdfBuffer);

//     const additionalPages = await mainPdfDoc.copyPages(
//       additionalPdfDoc,
//       additionalPdfDoc.getPageIndices(),
//     );

//     additionalPages.forEach((page) => {
//       mainPdfDoc.addPage(page);
//     });

//     const mergedPdfBytes = await mainPdfDoc.save();
//     return Buffer.from(mergedPdfBytes);
//   } catch (error) {
//     console.error('Error merging PDFs:', error);
//     throw new Error('Failed to merge PDFs');
//   }
// };

export default {
  createInvoice,
  createAgreement,
};
