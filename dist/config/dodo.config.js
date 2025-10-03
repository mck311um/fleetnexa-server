"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dodopayments_1 = __importDefault(require("dodopayments"));
const API_KEY = process.env.DODOPAYMENTS_API_KEY || '';
const ENVIRONMENT = process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode';
const client = new dodopayments_1.default({
    bearerToken: API_KEY,
    environment: ENVIRONMENT,
});
exports.default = client;
