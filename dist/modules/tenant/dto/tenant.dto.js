"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorefrontSettingsDtoSchema = exports.UpdateTenantDtoSchema = exports.TenantViolationSchema = void 0;
const zod_1 = require("zod");
exports.TenantViolationSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    violation: zod_1.z.string().min(2).max(100),
    description: zod_1.z.string().optional(),
    amount: zod_1.z.number().min(0, { message: 'Amount is required' }),
});
const TenantAddressSchema = zod_1.z.object({
    street: zod_1.z.string().min(2).max(100),
    villageId: zod_1.z.uuid(),
    stateId: zod_1.z.uuid(),
    countryId: zod_1.z.uuid(),
});
const CancellationPolicySchema = zod_1.z.object({
    amount: zod_1.z.number().min(0).optional(),
    policy: zod_1.z.string().max(100).optional(),
    minimumDays: zod_1.z.number().min(0).optional(),
    bookingMinimumDays: zod_1.z.number().min(0).optional(),
});
const LatePolicySchema = zod_1.z.object({
    amount: zod_1.z.number().min(0).optional(),
    maxHours: zod_1.z.number().min(0).optional(),
});
exports.UpdateTenantDtoSchema = zod_1.z.object({
    tenantName: zod_1.z.string().min(2).max(100),
    email: zod_1.z.email(),
    number: zod_1.z.string().min(7).max(15),
    logo: zod_1.z.url().optional().nullable(),
    address: TenantAddressSchema,
    website: zod_1.z.string().optional(),
    startTime: zod_1.z.string(),
    endTime: zod_1.z.string(),
    paymentMethods: zod_1.z.array(zod_1.z.string()).min(1),
    financialYearStart: zod_1.z.string(),
    currencyId: zod_1.z.uuid(),
    invoiceSequenceId: zod_1.z.uuid(),
    payableTo: zod_1.z.string().max(100).optional().nullable(),
    invoiceFootNotes: zod_1.z.string().max(500).optional(),
    fromUSDRate: zod_1.z.number().min(0).optional().nullable(),
    securityDeposit: zod_1.z.float64().min(0),
    additionalDriverFee: zod_1.z.float64().min(0),
    daysInMonth: zod_1.z.number().min(0),
    cancellationPolicy: CancellationPolicySchema,
    latePolicy: LatePolicySchema,
});
exports.StorefrontSettingsDtoSchema = zod_1.z
    .object({
    storefrontEnabled: zod_1.z.boolean(),
    description: zod_1.z.string().max(500).optional().nullable(),
})
    .refine((data) => !data.storefrontEnabled ||
    (data.description !== null &&
        data.description !== undefined &&
        data.description.trim().length > 0), {
    message: 'Description is required when storefront is enabled',
    path: ['description'],
});
