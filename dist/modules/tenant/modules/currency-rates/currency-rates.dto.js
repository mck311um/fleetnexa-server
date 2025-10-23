"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyRateSchema = void 0;
const zod_1 = require("zod");
exports.CurrencyRateSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    fromRate: zod_1.z.number().min(0),
    toRate: zod_1.z.number().min(0),
    enabled: zod_1.z.boolean(),
    currencyId: zod_1.z.uuid(),
});
