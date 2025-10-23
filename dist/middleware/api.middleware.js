"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const crypto_1 = __importDefault(require("crypto"));
const api = (req, res, next) => {
    const apiKey = req.header('x-api-key');
    const signature = req.header('x-signature');
    const timestamp = req.header('x-timestamp');
    if (!apiKey || !signature || !timestamp) {
        return res.status(401).json({ message: 'Missing auth headers' });
    }
    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({ message: 'Invalid API key' });
    }
    const now = Date.now();
    const requestTime = new Date(timestamp).getTime();
    const timeDiff = Math.abs(now - requestTime);
    if (timeDiff > 5 * 60 * 1000) {
        return res.status(401).json({ message: 'Request expired' });
    }
    const payload = `${apiKey}:${timestamp}`;
    const expectedSignature = crypto_1.default
        .createHmac('sha256', process.env.API_HMAC_SECRET)
        .update(payload)
        .digest('hex');
    if (signature !== expectedSignature) {
        return res.status(401).json({ message: 'Invalid signature' });
    }
    next();
};
exports.api = api;
