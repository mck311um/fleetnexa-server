"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const finance_controller_1 = __importDefault(require("../controllers/finance.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/transactions', auth_middleware_1.auth, finance_controller_1.default.getTransactions);
router.post('/rental/payment', auth_middleware_1.auth, finance_controller_1.default.addRentalPayment);
router.post('/rental/refund', auth_middleware_1.auth, finance_controller_1.default.addRefundPayment);
router.patch('/rental/refund', auth_middleware_1.auth, finance_controller_1.default.updateRefundPayment);
router.patch('/rental/payment', auth_middleware_1.auth, finance_controller_1.default.updateRentalPayment);
router.delete('/transaction/:id', auth_middleware_1.auth, finance_controller_1.default.removeTransaction);
exports.default = router;
