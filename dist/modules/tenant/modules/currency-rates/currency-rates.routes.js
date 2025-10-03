"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const currency_rates_controller_1 = __importDefault(require("./currency-rates.controller"));
const auth_middleware_1 = require("../../../../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.auth, currency_rates_controller_1.default.getTenantCurrencyRates);
router.put('/', auth_middleware_1.auth, currency_rates_controller_1.default.updateTenantCurrencyRate);
exports.default = router;
