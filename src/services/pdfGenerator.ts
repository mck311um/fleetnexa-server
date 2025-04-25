import axios from "axios";
import { InvoiceData } from "../types/pdf";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const apiKey = process.env.PDFMONKEY_API_KEY!;
const templateId = process.env.PDFMONKEY_TEMPLATE_ID!;
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

const createInvoice = async (
  invoiceData: InvoiceData,
  invoiceNumber: string,
  tenantCode: string
) => {
  try {
    const res = await pdfMonkeyApi.post("/documents", {
      document: {
        document_template_id: templateId,
        payload: invoiceData,
        status: "pending",
        meta: {
          _filename: `${invoiceNumber}.pdf`,
        },
      },
    });

    const document = res.data.document;
    const documentId = document.id;

    if (!documentId) {
      throw new Error("Document ID not found in response");
    }

    let documentDetails;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 2000));

      documentDetails = await pdfMonkeyApi.get(`/documents/${documentId}`);

      if (documentDetails.data.document.status === "success") {
        break;
      }

      if (documentDetails.data.document.status === "failed") {
        throw new Error("PDF generation failed");
      }
    }

    if (
      !documentDetails ||
      documentDetails.data.document.status !== "success"
    ) {
      throw new Error("PDF generation timed out");
    }

    const downloadUrl = documentDetails.data.document.download_url;
    const pdfResponse = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
    });

    const pdfBuffer = Buffer.from(pdfResponse.data, "binary");
    const s3Key = `Tenants/${tenantCode}/Invoices/${invoiceNumber}.pdf`;

    const uploadParams = {
      Bucket: awsBucketName,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    return {
      s3Key,
      documentId,
    };
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw new Error("Failed to create invoice");
  }
};

export default {
  createInvoice,
};
