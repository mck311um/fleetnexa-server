"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZohoAccessToken = void 0;
const axios_1 = __importDefault(require("axios"));
const getZohoAccessToken = async () => {
    const response = await axios_1.default.post('https://accounts.zoho.com/oauth/v2/token', null, {
        params: {
            refresh_token: process.env.ZOHO_REFRESH_TOKEN,
            client_id: process.env.ZOHO_CLIENT_ID,
            client_secret: process.env.ZOHO_CLIENT_SECRET,
            grant_type: 'refresh_token',
        },
    });
    return response.data.access_token;
};
exports.getZohoAccessToken = getZohoAccessToken;
