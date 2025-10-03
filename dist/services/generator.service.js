"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const slugify_1 = __importDefault(require("slugify"));
const crypto_1 = __importDefault(require("crypto"));
const generateInvoiceNumber = async (tenantId) => {
    const tenant = await prisma_config_1.default.tenant.findUnique({
        where: { id: tenantId },
        include: { invoiceSequence: true },
    });
    if (!tenant?.invoiceSequence) {
        throw new Error('Tenant has no invoice sequence configured');
    }
    const lastInvoice = await prisma_config_1.default.invoice.findFirst({
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
const generateRentalAgreementNumber = async (tenantId) => {
    const lastAgreement = await prisma_config_1.default.rentalAgreement.findFirst({
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
const generateRentalNumber = async (tenantId) => {
    const lastRental = await prisma_config_1.default.rental.findFirst({
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
const generateBookingCode = (tenantCode, rentalNumber) => {
    const cleanedTenantCode = tenantCode.replace(/-/g, '');
    const paddedRentalNumber = rentalNumber.padStart(6, '0');
    return `${cleanedTenantCode}-${paddedRentalNumber}`;
};
const generateTenantSlug = async (tenantName) => {
    let slug = '';
    slug = (0, slugify_1.default)(tenantName, { lower: true, strict: true });
    return slug;
};
const generateTenantCode = async (tenantName) => {
    const initials = tenantName
        .split(' ')
        .map((word) => word[0].toUpperCase())
        .join('');
    const existingTenants = await prisma_config_1.default.tenant.findMany({
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
    const nextNumber = seriesNumbers.length === 0 ? 1 : Math.max(...seriesNumbers) + 1;
    const series = nextNumber.toString().padStart(3, '0');
    return `${initials}-${series}`;
};
const generateUserName = async (firstName, lastName) => {
    const cleanFirst = firstName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const cleanLast = lastName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    let attempt = 1;
    let username = '';
    while (true) {
        const prefix = cleanFirst.substring(0, attempt);
        username = `${prefix}${cleanLast}`;
        const existingUser = await prisma_config_1.default.user.findUnique({
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
    return crypto_1.default.randomBytes(length).toString('base64').slice(0, length);
};
exports.default = {
    generateInvoiceNumber,
    generateRentalAgreementNumber,
    generateBookingCode,
    generateRentalNumber,
    generateTenantSlug,
    generateTenantCode,
    generateUserName,
    generateTempPassword,
};
