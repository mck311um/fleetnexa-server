"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transaction_controller_1 = __importDefault(require("./transaction.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.auth, transaction_controller_1.default.getTransactions);
router.post('/payment', auth_middleware_1.auth, transaction_controller_1.default.createPayment);
router.put('/payment', auth_middleware_1.auth, transaction_controller_1.default.updatePayment);
router.delete('/payment/:id', auth_middleware_1.auth, transaction_controller_1.default.deletePayment);
exports.default = router;
