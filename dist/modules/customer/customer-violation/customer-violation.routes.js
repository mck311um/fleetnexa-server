"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_violation_controller_1 = __importDefault(require("./customer-violation.controller"));
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('', auth_middleware_1.auth, customer_violation_controller_1.default.getCustomerViolations);
router.get('/:id', auth_middleware_1.auth, customer_violation_controller_1.default.getCustomerViolationById);
router.post('/', auth_middleware_1.auth, customer_violation_controller_1.default.addCustomerViolation);
router.put('/', auth_middleware_1.auth, customer_violation_controller_1.default.updateCustomerViolation);
router.delete('/:id', auth_middleware_1.auth, customer_violation_controller_1.default.deleteCustomerViolation);
exports.default = router;
