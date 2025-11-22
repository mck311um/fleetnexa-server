"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSchema = exports.CustomerAddressSchema = exports.CustomerDriverLicenseSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = __importDefault(require("zod"));
exports.CustomerDriverLicenseSchema = zod_1.default.object({
    id: zod_1.default.uuid(),
    customerId: zod_1.default.uuid(),
    licenseNumber: zod_1.default.string(),
    licenseIssued: zod_1.default.string(),
    licenseExpiry: zod_1.default.string(),
    image: zod_1.default.string().optional(),
});
exports.CustomerAddressSchema = zod_1.default.object({
    street: zod_1.default.string().optional(),
    villageId: zod_1.default.string().optional(),
    stateId: zod_1.default.string().optional(),
    countryId: zod_1.default.string().optional(),
});
exports.CustomerSchema = zod_1.default.object({
    id: zod_1.default.uuid(),
    firstName: zod_1.default.string(),
    lastName: zod_1.default.string(),
    email: zod_1.default.email(),
    gender: zod_1.default.string().optional(),
    dateOfBirth: zod_1.default.string(),
    phone: zod_1.default.string().optional(),
    profileImage: zod_1.default.string().optional(),
    status: zod_1.default.enum(client_1.CustomerStatus),
    license: exports.CustomerDriverLicenseSchema,
    address: exports.CustomerAddressSchema,
});
