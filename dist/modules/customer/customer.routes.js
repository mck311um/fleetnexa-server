"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_controller_1 = __importDefault(require("./customer.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/violations', auth_middleware_1.auth, customer_controller_1.default.getCustomerViolations);
router.get('/violation/:id', auth_middleware_1.auth, customer_controller_1.default.getCustomerViolationById);
router.post('/violation', auth_middleware_1.auth, customer_controller_1.default.addCustomerViolation);
router.put('/violation', auth_middleware_1.auth, customer_controller_1.default.updateCustomerViolation);
router.delete('/violation/:id', auth_middleware_1.auth, customer_controller_1.default.deleteCustomerViolation);
exports.default = router;
