"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBookingDtoSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const RentalDriverSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    driverId: zod_1.z.uuid(),
    isPrimary: zod_1.z.boolean().default(false),
});
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
    discountMin: zod_1.z.float64().min(0),
    discountMax: zod_1.z.float64().min(0),
    discountAmount: zod_1.z.float64().min(0),
    discountPolicy: zod_1.z.string().max(500).optional(),
    additionalDriverFees: zod_1.z.float64().min(0),
    extras: RentalExtrasSchema,
});
exports.CreateBookingDtoSchema = zod_1.z.object({
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
});
