"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerViolationSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CustomerViolationSchema = zod_1.default.object({
    id: zod_1.default.uuid(),
    customerId: zod_1.default.uuid(),
    violationId: zod_1.default.uuid(),
    violationDate: zod_1.default.string(),
    notes: zod_1.default.string().optional(),
});
