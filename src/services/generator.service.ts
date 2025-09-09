import prisma from '../config/prisma.config';
import slugify from 'slugify';
import crypto from 'crypto';

const generateInvoiceNumber = async (tenantId: string): Promise<string> => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { invoiceSequence: true },
  });

  if (!tenant?.invoiceSequence) {
    throw new Error('Tenant has no invoice sequence configured');
  }

  const lastInvoice = await prisma.invoice.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true },
  });

  const lastNumber = lastInvoice?.invoiceNumber
    ? parseInt(lastInvoice.invoiceNumber.match(/\d+$/)?.[0] || '0', 10)
    : 0;
  const nextNumber = lastNumber + 1;

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  let prefix = tenant.invoiceSequence.prefix;
  prefix = prefix
    .replace(/{year}/g, year)
    .replace(/{month}/g, month)
    .replace(/{day}/g, day)
    .replace(/{tenantId}/g, tenantId.substring(0, 4));

  const sequenceNumber = nextNumber.toString().padStart(3, '0');

  return `${prefix}${sequenceNumber}`;
};

const generateRentalAgreementNumber = async (
  tenantId: string,
): Promise<string> => {
  const lastAgreement = await prisma.rentalAgreement.findFirst({
    where: { tenantId },
    orderBy: { number: 'desc' },
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

  const formattedSequence = sequenceNumber.toString().padStart(4, '0');

  return `BA-${currentYear}-${formattedSequence}`;
};

const generateRentalNumber = async (tenantId: string): Promise<string> => {
  const lastRental = await prisma.rental.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: { rentalNumber: true },
  });

  if (!lastRental || !lastRental.rentalNumber) {
    return '000001';
  }

  const lastNumber = parseInt(lastRental.rentalNumber, 10);
  const nextNumber = lastNumber + 1;

  return nextNumber.toString().padStart(6, '0');
};

const generateBookingCode = (
  tenantCode: string,
  rentalNumber: string,
): string => {
  const cleanedTenantCode = tenantCode.replace(/-/g, '');

  const paddedRentalNumber = rentalNumber.padStart(6, '0');

  return `${cleanedTenantCode}-${paddedRentalNumber}`;
};

const generateTenantSlug = async (tenantName: string): Promise<string> => {
  let slug = '';
  slug = slugify(tenantName, { lower: true, strict: true });

  return slug;
};

const generateTenantCode = async (tenantName: string): Promise<string> => {
  const initials = tenantName
    .split(' ')
    .map((word) => word[0].toUpperCase())
    .join('');

  const existingTenants = await prisma.tenant.findMany({
    where: {
      tenantCode: {
        startsWith: initials,
      },
    },
    select: {
      tenantCode: true,
    },
  });

  const seriesNumbers = existingTenants.map((t) => {
    const parts = t.tenantCode.split('-');
    return parts[1] ? parseInt(parts[1], 10) : 0;
  });

  const nextNumber =
    seriesNumbers.length === 0 ? 1 : Math.max(...seriesNumbers) + 1;

  const series = nextNumber.toString().padStart(3, '0');

  return `${initials}-${series}`;
};

const generateUserName = async (
  firstName: string,
  lastName: string,
): Promise<string> => {
  const cleanFirst = firstName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanLast = lastName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  let attempt = 1;
  let username = '';

  while (true) {
    const prefix = cleanFirst.substring(0, attempt);
    username = `${prefix}${cleanLast}`;

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!existingUser) {
      return username;
    }

    attempt++;

    if (attempt > cleanFirst.length) {
      const randomNumber = Math.floor(1000 + Math.random() * 9000);
      username = `${cleanFirst[0]}${cleanLast}${randomNumber}`;
      return username;
    }
  }
};

// const generateAdminUsername = (tenantCode: string): string => {
//   const cleanTenantCode = tenantCode.replace(/-/g, '');
//   return `admin_${cleanTenantCode}`;
// };

const generateTempPassword = (length = 12) => {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
};

export default {
  generateInvoiceNumber,
  generateRentalAgreementNumber,
  generateBookingCode,
  generateRentalNumber,
  generateTenantSlug,
  generateTenantCode,
  generateUserName,
  generateTempPassword,
};
