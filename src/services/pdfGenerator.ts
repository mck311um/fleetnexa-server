import axios from "axios";
import { AgreementData, InvoiceData } from "../types/pdf";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const apiKey = process.env.PDFMONKEY_API_KEY!;
const invoiceId = process.env.PDFMONKEY_INVOICE_ID!;
const agreementId = process.env.PDFMONKEY_AGREEMENT_ID!;
const awsBucketName = process.env.AWS_BUCKET_NAME!;

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const pdfMonkeyApi = axios.create({
  baseURL: "https://api.pdfmonkey.io/api/v1",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

type DocumentType = "invoice" | "agreement";

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
  const templateId = documentType === "invoice" ? invoiceId : agreementId;
  const folder = documentType === "invoice" ? "Invoices" : "BookingAgreements";

  try {
    const res = await pdfMonkeyApi.post("/documents", {
      document: {
        document_template_id: templateId,
        payload: data,
        status: "pending",
        meta: {
          _filename: `${documentNumber}.pdf`,
        },
      },
    });

    const document = res.data.document;
    const documentId = document.id;

    if (!documentId) {
      throw new Error("Document ID not found in response");
    }

    const documentDetails = await waitForDocumentGeneration(documentId);

    const pdfBuffer = await downloadPdf(
      documentDetails.data.document.download_url
    );

    const s3Key = `Tenants/${tenantCode}/${folder}/${documentNumber}.pdf`;
    await uploadToS3(pdfBuffer, s3Key);

    return { s3Key, documentId };
  } catch (error) {
    console.error(`Error creating ${documentType}:`, error);
    throw new Error(`Failed to create ${documentType}`);
  }
};

const waitForDocumentGeneration = async (
  documentId: string,
  maxAttempts = 10
) => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const documentDetails = await pdfMonkeyApi.get(`/documents/${documentId}`);
    const status = documentDetails.data.document.status;

    if (status === "success") return documentDetails;
    if (status === "failed") throw new Error("PDF generation failed");
  }

  throw new Error("PDF generation timed out");
};

const downloadPdf = async (downloadUrl: string) => {
  const pdfResponse = await axios.get(downloadUrl, {
    responseType: "arraybuffer",
  });
  return Buffer.from(pdfResponse.data, "binary");
};

const uploadToS3 = async (pdfBuffer: Buffer, s3Key: string) => {
  const uploadParams = {
    Bucket: awsBucketName,
    Key: s3Key,
    Body: pdfBuffer,
    ContentType: "application/pdf",
  };
  await s3Client.send(new PutObjectCommand(uploadParams));
};

const createInvoice = (
  invoiceData: InvoiceData,
  invoiceNumber: string,
  tenantCode: string
) => {
  return createDocument({
    data: invoiceData,
    documentType: "invoice",
    documentNumber: invoiceNumber,
    tenantCode,
  });
};

const createAgreement = (
  agreementData: AgreementData,
  agreementNumber: string,
  tenantCode: string
) => {
  return createDocument({
    data: agreementData,
    documentType: "agreement",
    documentNumber: agreementNumber,
    tenantCode,
  });
};

export default {
  createInvoice,
  createAgreement,
};
