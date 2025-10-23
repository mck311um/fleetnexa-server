"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorefrontBookingSchema = void 0;
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
    discountMin: zod_1.z.float64().min(0),
    discountMax: zod_1.z.float64().min(0),
    discountAmount: zod_1.z.float64().min(0),
    discountPolicy: zod_1.z.string().max(500).optional(),
    additionalDriverFees: zod_1.z.float64().min(0),
    extras: RentalExtrasSchema,
});
exports.StorefrontBookingSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date(),
    pickupLocationId: zod_1.z.uuid(),
    returnLocationId: zod_1.z.uuid(),
    vehicleId: zod_1.z.uuid(),
    chargeTypeId: zod_1.z.uuid(),
    values: RentalValuesSchema,
});
