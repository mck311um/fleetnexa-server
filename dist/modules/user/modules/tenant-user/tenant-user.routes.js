"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tenant_user_controller_1 = __importDefault(require("./tenant-user.controller"));
const router = express_1.default.Router();
router.post('/forgot-password', tenant_user_controller_1.default.requestPassword);
router.post('/verify-email', tenant_user_controller_1.default.verifyEmailToken);
router.post('/change-password', tenant_user_controller_1.default.changePassword);
exports.default = router;
