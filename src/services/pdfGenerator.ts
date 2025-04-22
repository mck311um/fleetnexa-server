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
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw new Error("Failed to create invoice");
  }
};

export default {
  createInvoice,
};
