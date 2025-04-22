import axios from "axios";
import { InvoiceData } from "../types/pdf";

const apiKey = process.env.PDFMONKEY_API_KEY!;
const templateId = process.env.PDFMONKEY_TEMPLATE_ID!;

const pdfMonkeyApi = axios.create({
  baseURL: "https://api.pdfmonkey.io/api/v1",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getDocumentStatus = async (id: string) => {
  const res = await pdfMonkeyApi.get(`/documents/${id}`);
  return res.data.document;
};

const createInvoice = async (
  invoiceData: InvoiceData,
  invoiceNumber: string
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
    console.log("Document ID:", documentId);

    if (!documentId) {
      throw new Error("Document ID not found in response");
    }

    for (let i = 0; i < 10; i++) {
      await sleep(2000);
      const documentStatus = await getDocumentStatus(documentId);

      if (documentStatus.status === "success") {
        return documentStatus.download_url;
      }

      if (documentStatus.status === "failed") {
        throw new Error("PDF generation failed");
      }

      console.log(
        `Generation attempt ${i + 1}: Status is ${documentStatus.status}`
      );
    }

    throw new Error("PDF generation timed out after 20 seconds");
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw new Error("Failed to create invoice");
  }
};

export default {
  createInvoice,
};
