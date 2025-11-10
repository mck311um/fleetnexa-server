"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyTypeSchema = void 0;
const zod_1 = require("zod");
exports.BodyTypeSchema = zod_1.z.object({
    id: zod_1.z.uuid().optional(),
    bodyType: zod_1.z.string().min(1).max(100),
});
