"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../config/logger");
const tenant_repository_1 = require("../repository/tenant.repository");
const user_repository_1 = require("../modules/user/user.repository");
const auth = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res
            .status(401)
            .json({ message: 'No auth token, authorization denied' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(req.user.tenantId);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        const user = await user_repository_1.userRepo.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        req.context = {
            tenant,
            user,
            tenantCode: req.user.tenantCode,
        };
        next();
    }
    catch (error) {
        logger_1.logger.e(error, 'Token verification failed');
        res.status(401).json({ message: 'Token is not valid' });
    }
};
exports.auth = auth;
