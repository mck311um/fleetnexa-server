"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingDtoSchema = exports.StorefrontGuestBookingSchema = exports.StorefrontCustomerSchema = exports.StorefrontUserBookingSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const RentalExtrasSchema = zod_1.z.array(zod_1.z.object({
    id: zod_1.z.uuid(),
    extraId: zod_1.z.uuid(),
    amount: zod_1.z.float64().min(0),
    customAmount: zod_1.z.boolean().default(false),
    valuesId: zod_1.z.uuid(),
}));
const RentalValuesSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    numberOfDays: zod_1.z.number().min(1),
    basePrice: zod_1.z.float64().min(0),
    customBasePrice: zod_1.z.boolean().default(false),
    totalCost: zod_1.z.float64().min(0),
    customTotalCost: zod_1.z.boolean().default(false),
    discount: zod_1.z.float64().min(0),
    customDiscount: zod_1.z.boolean().default(false),
    deliveryFee: zod_1.z.float64().min(0),
    customDeliveryFee: zod_1.z.boolean().default(false),
    collectionFee: zod_1.z.float64().min(0),
    customCollectionFee: zod_1.z.boolean().default(false),
    deposit: zod_1.z.float64().min(0),
    customDeposit: zod_1.z.boolean().default(false),
    totalExtras: zod_1.z.float64().min(0),
    subTotal: zod_1.z.float64().min(0),
    netTotal: zod_1.z.float64().min(0),
    discountAmount: zod_1.z.float64().min(0),
    discountPolicy: zod_1.z.string().max(500).optional(),
    additionalDriverFees: zod_1.z.float64().min(0),
    extras: RentalExtrasSchema,
});
exports.StorefrontUserBookingSchema = zod_1.z.object({
    userId: zod_1.z.uuid(),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    pickupLocationId: zod_1.z.uuid(),
    returnLocationId: zod_1.z.uuid(),
    vehicleId: zod_1.z.uuid(),
    tenantId: zod_1.z.uuid(),
    values: RentalValuesSchema,
});
exports.StorefrontCustomerSchema = zod_1.z.object({
    firstName: zod_1.z.string().max(100),
    lastName: zod_1.z.string().max(100),
    email: zod_1.z.email().max(255),
    gender: zod_1.z.string().optional(),
    phone: zod_1.z.string().max(20),
    driverLicenseNumber: zod_1.z.string().max(50),
    licenseExpiry: zod_1.z.string().max(50),
    licenseIssued: zod_1.z.string().max(50),
    dateOfBirth: zod_1.z.string(),
    license: zod_1.z.string().optional(),
    address: zod_1.z.object({
        street: zod_1.z.string().optional(),
        villageId: zod_1.z.string().optional(),
        stateId: zod_1.z.string().optional(),
        countryId: zod_1.z.string().optional(),
    }),
});
exports.StorefrontGuestBookingSchema = zod_1.z.object({
    customer: exports.StorefrontCustomerSchema,
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    pickupLocationId: zod_1.z.uuid(),
    returnLocationId: zod_1.z.uuid(),
    vehicleId: zod_1.z.uuid(),
    tenantId: zod_1.z.uuid(),
    values: RentalValuesSchema,
});
const RentalDriverSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    driverId: zod_1.z.uuid(),
    isPrimary: zod_1.z.boolean().default(false),
});
exports.BookingDtoSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    startDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid startDate',
    }),
    endDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid endDate',
    }),
    pickupLocationId: zod_1.z.uuid(),
    returnLocationId: zod_1.z.uuid(),
    vehicleId: zod_1.z.uuid(),
    chargeTypeId: zod_1.z.uuid(),
    agent: zod_1.z.enum(client_1.Agent).optional(),
    notes: zod_1.z.string().max(500).optional(),
    drivers: zod_1.z.array(RentalDriverSchema).min(1),
    values: RentalValuesSchema,
    bookingCode: zod_1.z.string().optional(),
    bookingNumber: zod_1.z.string().optional(),
    status: zod_1.z.enum(client_1.RentalStatus),
});
