"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../config/logger");
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const storefrontAuth = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res
            .status(401)
            .json({ message: 'No auth token, authorization denied' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.storefrontUser = decoded.storefrontUser;
        const storefrontUser = await prisma_config_1.default.storefrontUser.findUnique({
            where: { id: req.storefrontUser.id },
        });
        if (!storefrontUser) {
            return res.status(404).json({ message: 'Storefront user not found' });
        }
        req.context = {
            tenant: null,
            user: null,
            tenantCode: '',
            storefrontUser,
        };
        next();
    }
    catch (error) {
        logger_1.logger.e(error, 'Token verification failed');
        res.status(401).json({ message: 'Token is not valid' });
    }
};
exports.storefrontAuth = storefrontAuth;
