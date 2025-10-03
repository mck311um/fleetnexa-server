"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dodo_controller_1 = __importDefault(require("../controllers/dodo.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/invoice/:paymentId', auth_middleware_1.auth, dodo_controller_1.default.getInvoice);
router.post('/payment', auth_middleware_1.auth, dodo_controller_1.default.createDodoPayment);
router.post('/webhook', dodo_controller_1.default.dodoPaymentWebhook);
exports.default = router;
