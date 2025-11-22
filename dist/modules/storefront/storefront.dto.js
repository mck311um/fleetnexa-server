"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorefrontRatingSchema = void 0;
const zod_1 = require("zod");
exports.StorefrontRatingSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    tenantId: zod_1.z.uuid().optional(),
    fullName: zod_1.z.string().max(200),
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().max(1000).optional(),
    email: zod_1.z.email().max(255),
});
