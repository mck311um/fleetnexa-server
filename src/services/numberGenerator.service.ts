import prisma from "../config/prisma.config";

const generateInvoiceNumber = async (tenantId: string): Promise<string> => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { invoiceSequence: true },
  });

  if (!tenant?.invoiceSequence) {
    throw new Error("Tenant has no invoice sequence configured");
  }

  const lastInvoice = await prisma.invoice.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    select: { invoiceNumber: true },
  });

  const lastNumber = lastInvoice?.invoiceNumber
    ? parseInt(lastInvoice.invoiceNumber.match(/\d+$/)?.[0] || "0", 10)
    : 0;
  const nextNumber = lastNumber + 1;

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  let prefix = tenant.invoiceSequence.prefix;
  prefix = prefix
    .replace(/{year}/g, year)
    .replace(/{month}/g, month)
    .replace(/{day}/g, day)
    .replace(/{tenantId}/g, tenantId.substring(0, 4));

  const sequenceNumber = nextNumber.toString().padStart(3, "0");

  return `${prefix}${sequenceNumber}`;
};

const generateRentalAgreementNumber = async (
  tenantId: string
): Promise<string> => {
  const lastAgreement = await prisma.rentalAgreement.findFirst({
    where: { tenantId },
    orderBy: { number: "desc" },
    select: { number: true },
  });

  const currentYear = new Date().getFullYear().toString();
  let sequenceNumber = 1;

  if (lastAgreement?.number) {
    const match = lastAgreement.number.match(/BA-\d{4}-(\d{4})/);
    if (match && match[1]) {
      sequenceNumber = parseInt(match[1], 10) + 1;
    }
  }

  const formattedSequence = sequenceNumber.toString().padStart(4, "0");

  return `BA-${currentYear}-${formattedSequence}`;
};

const generateRentalNumber = async (tenantId: string): Promise<string> => {
  const lastRental = await prisma.rental.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    select: { rentalNumber: true },
  });

  if (!lastRental || !lastRental.rentalNumber) {
    return "000001";
  }

  const lastNumber = parseInt(lastRental.rentalNumber, 10);
  const nextNumber = lastNumber + 1;

  return nextNumber.toString().padStart(6, "0");
};

export default {
  generateInvoiceNumber,
  generateRentalAgreementNumber,
  generateRentalNumber,
};
