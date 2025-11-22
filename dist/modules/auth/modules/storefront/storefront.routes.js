"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storefront_controller_1 = __importDefault(require("./storefront.controller"));
const router = express_1.default.Router();
router.post('/create', storefront_controller_1.default.createUser);
router.post('/login', storefront_controller_1.default.loginUser);
router.post('/forgot-password', storefront_controller_1.default.requestPasswordReset);
router.post('/verify-code', storefront_controller_1.default.verifyPasswordResetToken);
router.post('/reset-password', storefront_controller_1.default.resetPassword);
exports.default = router;
