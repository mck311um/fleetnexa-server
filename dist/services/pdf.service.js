"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfService = void 0;
const axios_1 = __importDefault(require("axios"));
const client_s3_1 = require("@aws-sdk/client-s3");
const pdf_lib_1 = require("pdf-lib");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class PDFService {
    async getPDFFromS3(bucketName, key) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: bucketName,
                Key: key,
            });
            const response = await s3Client.send(command);
            return (await this.streamToBuffer(response.Body));
        }
        catch (error) {
            console.error('Error fetching PDF from S3:', error);
            throw error;
        }
    }
    async getPresignedURL(bucketName, key, expiresIn = 3600) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: bucketName,
                Key: key,
            });
            return await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn });
        }
        catch (error) {
            console.error('Error generating presigned URL:', error);
            throw error;
        }
    }
    async streamToBuffer(stream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }
    async getPDFAsBase64(bucketName, key) {
        const pdfBuffer = await this.getPDFFromS3(bucketName, key);
        return pdfBuffer.toString('base64');
    }
}
exports.pdfService = new PDFService();
const apiKey = process.env.PDFMONKEY_API_KEY;
const invoiceId = process.env.PDFMONKEY_INVOICE_ID;
const agreementId = process.env.PDFMONKEY_AGREEMENT_ID;
const awsBucketName = process.env.AWS_BUCKET_NAME;
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
const pdfMonkeyApi = axios_1.default.create({
    baseURL: 'https://api.pdfmonkey.io/api/v1',
    headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});
const createDocument = async ({ data, documentType, documentNumber, tenantCode, }) => {
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
        const pdfBuffer = await downloadPdf(documentDetails.data.document.download_url);
        const s3Key = `Tenants/${tenantCode}/${folder}/${documentNumber}.pdf`;
        const publicUrl = await uploadToS3(pdfBuffer, s3Key);
        if (documentType === 'agreement') {
            const additionalPageUrl = 'https://fleetnexa.s3.us-east-1.amazonaws.com/Global+Images/BookingAgreementPage.pdf';
            const additionalPageBuffer = await downloadPdf(additionalPageUrl);
            const signablePdfBuffer = await replaceLastPage(pdfBuffer, additionalPageBuffer);
            const signableS3Key = `Tenants/${tenantCode}/${folder}/${documentNumber}_signable.pdf`;
            const signablePublicUrl = await uploadToS3(signablePdfBuffer, signableS3Key);
            return {
                s3Key,
                documentId,
                publicUrl,
                signableS3Key,
                signablePublicUrl,
            };
        }
        return { s3Key, documentId, publicUrl };
    }
    catch (error) {
        console.error(`Error creating ${documentType}:`, error);
        throw new Error(`Failed to create ${documentType}`);
    }
};
const waitForDocumentGeneration = async (documentId, maxAttempts = 10) => {
    let attempts = 0;
    while (attempts < maxAttempts) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const documentDetails = await pdfMonkeyApi.get(`/documents/${documentId}`);
        const status = documentDetails.data.document.status;
        if (status === 'success')
            return documentDetails;
        if (status === 'failed')
            throw new Error('PDF generation failed');
    }
    throw new Error('PDF generation timed out');
};
const downloadPdf = async (downloadUrl) => {
    const pdfResponse = await axios_1.default.get(downloadUrl, {
        responseType: 'arraybuffer',
    });
    return Buffer.from(pdfResponse.data, 'binary');
};
const uploadToS3 = async (pdfBuffer, s3Key) => {
    const uploadParams = {
        Bucket: awsBucketName,
        Key: s3Key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
    };
    await s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
    return `https://${awsBucketName}.s3.amazonaws.com/${s3Key}`;
};
const createInvoice = async (invoiceData, invoiceNumber, tenantCode) => {
    const { s3Key, documentId, publicUrl } = await createDocument({
        data: invoiceData,
        documentType: 'invoice',
        documentNumber: invoiceNumber,
        tenantCode,
    });
    return { s3Key, documentId, publicUrl };
};
const createAgreement = async (agreementData, agreementNumber, tenantCode) => {
    const { s3Key, documentId, publicUrl, signablePublicUrl } = await createDocument({
        data: agreementData,
        documentType: 'agreement',
        documentNumber: agreementNumber,
        tenantCode,
    });
    return { s3Key, documentId, publicUrl, signablePublicUrl };
};
const replaceLastPage = async (originalPdfBuffer, newPageBuffer) => {
    try {
        const originalPdfDoc = await pdf_lib_1.PDFDocument.load(originalPdfBuffer);
        const newPagePdfDoc = await pdf_lib_1.PDFDocument.load(newPageBuffer);
        const pageIndices = Array.from({ length: originalPdfDoc.getPageCount() - 1 }, (_, i) => i);
        const newPdfDoc = await pdf_lib_1.PDFDocument.create();
        const pages = await newPdfDoc.copyPages(originalPdfDoc, pageIndices);
        pages.forEach((page) => newPdfDoc.addPage(page));
        const [newLastPage] = await newPdfDoc.copyPages(newPagePdfDoc, [0]);
        newPdfDoc.addPage(newLastPage);
        const mergedPdfBytes = await newPdfDoc.save();
        return Buffer.from(mergedPdfBytes);
    }
    catch (error) {
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
exports.default = {
    createInvoice,
    createAgreement,
};
