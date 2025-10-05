"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleSchema = exports.VehicleFeatureSchema = exports.VehicleDiscountSchema = exports.UpdateVehicleStatusSchema = void 0;
const zod_1 = require("zod");
exports.UpdateVehicleStatusSchema = zod_1.z.object({
    vehicleId: zod_1.z.uuid(),
    status: zod_1.z.uuid(),
});
exports.VehicleDiscountSchema = zod_1.z.object({
    periodMin: zod_1.z.number().min(1),
    periodMax: zod_1.z.number().min(1),
    amount: zod_1.z.string(),
    discountPolicy: zod_1.z.string(),
    id: zod_1.z.uuid().optional(),
});
exports.VehicleFeatureSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    feature: zod_1.z.string(),
});
exports.VehicleSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    color: zod_1.z.string(),
    engineVolume: zod_1.z.number(),
    featuredImage: zod_1.z.string(),
    features: zod_1.z.array(exports.VehicleFeatureSchema).optional(),
    fuelLevel: zod_1.z.number(),
    images: zod_1.z.array(zod_1.z.string()).nullable(),
    licensePlate: zod_1.z.string(),
    brandId: zod_1.z.uuid(),
    modelId: zod_1.z.uuid(),
    numberOfSeats: zod_1.z.number(),
    numberOfDoors: zod_1.z.number(),
    odometer: zod_1.z.number().nullable(),
    steering: zod_1.z.string(),
    vin: zod_1.z.string().nullable(),
    year: zod_1.z
        .number()
        .min(1900)
        .max(new Date().getFullYear() + 1),
    transmissionId: zod_1.z.uuid(),
    vehicleStatusId: zod_1.z.uuid(),
    wheelDriveId: zod_1.z.uuid(),
    fuelTypeId: zod_1.z.uuid(),
    dayPrice: zod_1.z.number(),
    weekPrice: zod_1.z.number(),
    monthPrice: zod_1.z.number(),
    timeBetweenRentals: zod_1.z.number(),
    minimumAge: zod_1.z.number(),
    minimumRental: zod_1.z.number(),
    fuelPolicyId: zod_1.z.uuid(),
    locationId: zod_1.z.uuid(),
    drivingExperience: zod_1.z.number(),
    refundAmount: zod_1.z.number().nullable(),
    discounts: zod_1.z.array(exports.VehicleDiscountSchema).optional(),
});
