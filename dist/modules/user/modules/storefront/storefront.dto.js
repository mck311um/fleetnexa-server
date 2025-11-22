"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordSchema = exports.StorefrontUserSchema = void 0;
const zod_1 = require("zod");
exports.StorefrontUserSchema = zod_1.z.object({
    id: zod_1.z.uuid().optional(),
    firstName: zod_1.z.string().min(1).max(50),
    lastName: zod_1.z.string().min(1).max(50),
    email: (0, zod_1.email)().max(100),
    gender: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    driversLicenseNumber: zod_1.z.string().min(5),
    licenseExpiry: zod_1.z.string(),
    licenseIssued: zod_1.z.string(),
    license: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().optional(),
    street: zod_1.z.string().optional(),
    villageId: zod_1.z.string().optional(),
    countryId: zod_1.z.string().optional(),
    stateId: zod_1.z.string().optional(),
});
exports.ChangePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(8).max(100),
    newPassword: zod_1.z.string().min(8).max(100),
});
